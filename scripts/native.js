// پلاگین اندروید «قفل هنگام مطالعه» (Screen Pinning)
const fs = require('fs');
const dir = 'android/app/src/main/java/com/studytimer/app/';
fs.writeFileSync(dir + 'KioskPlugin.java', `package com.studytimer.app;

import android.app.ActivityManager;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Kiosk")
public class KioskPlugin extends Plugin {
  private boolean locked() {
    ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
    return am.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
  }
  @PluginMethod
  public void start(final PluginCall call) {
    getActivity().runOnUiThread(() -> {
      try { if (!locked()) getActivity().startLockTask(); } catch (Exception e) {}
      call.resolve();
    });
  }
  @PluginMethod
  public void stop(final PluginCall call) {
    getActivity().runOnUiThread(() -> {
      try { if (locked()) getActivity().stopLockTask(); } catch (Exception e) {}
      call.resolve();
    });
  }
  @PluginMethod
  public void isLocked(PluginCall call) {
    JSObject o = new JSObject(); o.put("locked", locked()); call.resolve(o);
  }
}
`);
fs.writeFileSync(dir + 'MainActivity.java', `package com.studytimer.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(KioskPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
`);
console.log('پلاگین Kiosk اضافه شد');
