// پلاگین‌های اندروید: «قفل هنگام مطالعه» (Screen Pinning) و «اسکرین‌تایم» (UsageStats) + مجوزها
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
fs.writeFileSync(dir + 'ScreenTimePlugin.java', `package com.studytimer.app;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Process;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "ScreenTime")
public class ScreenTimePlugin extends Plugin {
  private boolean granted() {
    AppOpsManager ops = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
    int mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), getContext().getPackageName());
    return mode == AppOpsManager.MODE_ALLOWED;
  }
  @PluginMethod
  public void hasAccess(PluginCall call) {
    JSObject o = new JSObject(); o.put("granted", granted()); call.resolve(o);
  }
  @PluginMethod
  public void openSettings(PluginCall call) {
    Intent i = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getContext().startActivity(i);
    call.resolve();
  }
  private void add(long[] tot, long[] b, long s, long e) {
    for (int i = 0; i < tot.length; i++) {
      long a = Math.max(s, b[i]), z = Math.min(e, b[i + 1]);
      if (z > a) tot[i] += z - a;
    }
  }
  @PluginMethod
  public void weekUsage(PluginCall call) {
    try {
      int n = 7;
      long[] b = new long[n + 1];
      Calendar c = Calendar.getInstance();
      c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
      c.add(Calendar.DAY_OF_MONTH, -(n - 1));
      for (int i = 0; i <= n; i++) { b[i] = c.getTimeInMillis(); c.add(Calendar.DAY_OF_MONTH, 1); }
      long end = Math.min(System.currentTimeMillis(), b[n]);
      Intent home = new Intent(Intent.ACTION_MAIN);
      home.addCategory(Intent.CATEGORY_HOME);
      ResolveInfo ri = getContext().getPackageManager().resolveActivity(home, 0);
      String launcher = (ri != null && ri.activityInfo != null) ? ri.activityInfo.packageName : "";
      UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
      UsageEvents ev = usm.queryEvents(b[0], end);
      UsageEvents.Event e = new UsageEvents.Event();
      Map<String, Long> open = new HashMap<>();
      long[] tot = new long[n];
      while (ev.hasNextEvent()) {
        ev.getNextEvent(e);
        String pkg = e.getPackageName();
        if (pkg == null || pkg.equals(launcher) || pkg.equals("com.android.systemui")) continue;
        String k = pkg + "/" + e.getClassName();
        int t = e.getEventType();
        if (t == 1) open.put(k, e.getTimeStamp());
        else if (t == 2 && open.containsKey(k)) add(tot, b, open.remove(k), e.getTimeStamp());
      }
      for (Long s : open.values()) add(tot, b, s, end);
      JSArray arr = new JSArray();
      for (int i = 0; i < n; i++) { JSObject o = new JSObject(); o.put("t", b[i]); o.put("ms", tot[i]); arr.put(o); }
      JSObject r = new JSObject(); r.put("days", arr);
      call.resolve(r);
    } catch (Exception ex) {
      call.reject(String.valueOf(ex.getMessage()));
    }
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
    registerPlugin(ScreenTimePlugin.class);
    super.onCreate(savedInstanceState);
  }
}
`);
const mf = 'android/app/src/main/AndroidManifest.xml';
let m = fs.readFileSync(mf, 'utf8');
if (!m.includes('PACKAGE_USAGE_STATS')) {
  m = m.replace('</manifest>', '    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />\n    <queries><intent><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.HOME" /></intent></queries>\n</manifest>');
  fs.writeFileSync(mf, m);
}
console.log('پلاگین‌های Kiosk و ScreenTime اضافه شدند');
