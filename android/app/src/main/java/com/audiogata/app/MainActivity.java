package com.audiogata.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // App-local plugins are registered here; npm ones come from cap sync.
        registerPlugin(PoTokenMinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
