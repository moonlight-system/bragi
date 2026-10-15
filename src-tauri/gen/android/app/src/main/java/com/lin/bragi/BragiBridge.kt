package com.lin.bragi

import android.Manifest
import android.content.ContentUris
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.io.FileOutputStream

class BragiBridge(
    private val context: Context,
    private val requestPermission: (String) -> Unit,
) {
    private val permission =
        if (Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_AUDIO
        else Manifest.permission.READ_EXTERNAL_STORAGE

    private val collection =
        if (Build.VERSION.SDK_INT >= 29) MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        else MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

    @JavascriptInterface
    fun hasPermission(): Boolean =
        ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED

    @JavascriptInterface
    fun askPermission() = requestPermission(permission)

    // every mp3 on the device, as a JSON array
    @JavascriptInterface
    fun listMp3(): String {
        val result = JSONArray()
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
        )
        context.contentResolver.query(
            collection, projection,
            "${MediaStore.Audio.Media.MIME_TYPE} = ?", arrayOf("audio/mpeg"), null
        )?.use { c ->
            val idCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val fileCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
            val titleCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            while (c.moveToNext()) {
                val title = c.getString(titleCol)?.trim().orEmpty()
                val fileName = (c.getString(fileCol) ?: "").replace(Regex("\\.mp3$", RegexOption.IGNORE_CASE), "")
                val artist = c.getString(artistCol)?.trim().orEmpty()
                result.put(JSONObject().apply {
                    put("id", c.getLong(idCol).toString())
                    put("name", if (title.isNotEmpty()) title else fileName)
                    // Android reports a missing artist as "<unknown>"
                    put("artist", if (artist.isEmpty() || artist == "<unknown>") JSONObject.NULL else artist)
                })
            }
        }
        return result.toString()
    }

    // copies one file from MediaStore straight to destPath, without passing its bytes through JS
    @JavascriptInterface
    fun copyMp3(id: String, destPath: String): Boolean = try {
        val uri = ContentUris.withAppendedId(collection, id.toLong())
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(destPath).use { output -> input.copyTo(output) }
        } != null
    } catch (e: Exception) {
        android.util.Log.e("Bragi", "copyMp3 failed", e)
        false
    }
}