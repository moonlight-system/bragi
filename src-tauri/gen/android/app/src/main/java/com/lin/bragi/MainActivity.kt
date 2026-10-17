package com.lin.bragi

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build

class MainActivity : TauriActivity() {
  private var webView: WebView? = null

  // tells the page whether the user granted the permission
  private val permissionLauncher =
    registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
      webView?.post {
        webView?.evaluateJavascript(
          "window.dispatchEvent(new CustomEvent('bragi-permission', { detail: $granted }))", null
        )
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    // Android 13+: the notification only shows if the user allows it
    if (Build.VERSION.SDK_INT >= 33 &&
        checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
      requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
    }

    // notification buttons -> JS
    MediaPlaybackService.onCommand = { cmd, arg ->
      runOnUiThread {
        webView?.evaluateJavascript("window.__bragiMedia && window.__bragiMedia('$cmd', $arg)", null)
      }
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    this.webView = webView
    webView.addJavascriptInterface(MediaBridge(applicationContext), "BragiMedia")
    webView.addJavascriptInterface(
      BragiBridge(this) { permission -> runOnUiThread { permissionLauncher.launch(permission) } },
      "BragiNative"
    )
  }

  override fun onDestroy() {
    MediaPlaybackService.onCommand = null
    super.onDestroy()
  }
}