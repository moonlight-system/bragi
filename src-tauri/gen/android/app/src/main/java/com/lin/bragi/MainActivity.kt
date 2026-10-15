package com.lin.bragi

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts

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
  }

  override fun onWebViewCreate(webView: WebView) {
    this.webView = webView
    webView.addJavascriptInterface(
      BragiBridge(this) { permission -> runOnUiThread { permissionLauncher.launch(permission) } },
      "BragiNative"
    )
  }
}