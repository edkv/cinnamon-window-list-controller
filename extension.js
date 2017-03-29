const Main = imports.ui.main;
const KeybindingManager = Main.keybindingManager;
const AppletManager = imports.ui.applet.AppletManager;
const Settings = imports.ui.settings;

const windowListUUID = 'window-list@cinnamon.org';
const settings = {};

function init(metadata) {
  setupSettings(metadata.uuid);
}

function enable() {
  addHotKeys();
}

function disable() {
  removeHotKeys();
}

function setupSettings(uuid) {
  const s = new Settings.ExtensionSettings(settings, uuid);

  const settingNames = [
    'nextWindowHotKey',
    'previousWindowHotKey',
    'moveRightHotKey',
    'moveLeftHotKey'
  ]
 
  for (let i = 1; i <= 10; i++) {
    settingNames.push('window' + i + 'HotKey');
  }

  settingNames.forEach(function(name) {
    s.bindProperty(Settings.BindingDirection.IN, name, name, addHotKeys);
  });
}

function addHotKeys() {
  addHotKey('nextWindowHotKey', function() {
    activateWindow(getNextWindow());
  });

  addHotKey('previousWindowHotKey', function() {
    activateWindow(getPreviousWindow());
  });

  addHotKey('moveRightHotKey', function() {
    moveActiveWindow(+1);
  });

  addHotKey('moveLeftHotKey', function() {
    moveActiveWindow(-1);
  });

  for (let i = 0; i <= 9; i++) {
    let key = (i === 0) ? 10 : i;

    addHotKey('window' + key + 'HotKey', function() {
      const windows = getWorkspaceWindows();
      const targetWindow = windows[key - 1];

      if (targetWindow) {
        activateWindow(targetWindow);
      }
    });
  }
}

function removeHotKeys() {
  removeHotKey('nextWindowHotKey');
  removeHotKey('previousWindowHotKey');
  removeHotKey('moveRightHotKey');
  removeHotKey('moveLeftHotKey');

  for (let i = 1; i <= 10; i++) {
    removeHotKey('window' + i + 'HotKey');
  }
}

function addHotKey(name, action) {
  KeybindingManager.addHotKey(name, settings[name], action);
}

function removeHotKey(name) {
  KeybindingManager.removeHotKey(name);
}

function activateWindow(window) {
  Main.activateWindow(window.metaWindow);
}

function moveActiveWindow(direction) {
  const windowList = getWindowList();
  const windows = getAllWindows();
  const activeWindowIndex = getActiveWindowIndex(windows);

  if (activeWindowIndex === null) {
    return;
  }

  const activeWindow = windows[activeWindowIndex];
  let currentWindowAtNewPosition;

  if (direction > 0) {
    currentWindowAtNewPosition = getNextWindow();
  } else {
    currentWindowAtNewPosition = getPreviousWindow();
  }

  windowList.manager_container.set_child_at_index(
    activeWindow.actor,
    windows.indexOf(currentWindowAtNewPosition)
  )
}

function getNextWindow() {
  const windows = getWorkspaceWindows();
  const activeWindowIndex = getActiveWindowIndex(windows);

  if (activeWindowIndex === null) {
    return null;
  } else if (activeWindowIndex === windows.length - 1) {
    return windows[0];
  } else {
    return windows[activeWindowIndex + 1];
  }
}

function getPreviousWindow() {
  const windows = getWorkspaceWindows();
  const activeWindowIndex = getActiveWindowIndex(windows);

  if (activeWindowIndex === null) {
    return null;
  } else if (activeWindowIndex === 0) {
    return windows[windows.length - 1];
  } else {
    return windows[activeWindowIndex - 1];
  }
}

function getActiveWindowIndex(windows) {
  for (let i = 0; i < windows.length; i++) {
    if (windows[i].metaWindow.has_focus()) {
      return i;
    }
  }
  return null;
}

function getWindowList() {
  return AppletManager.getRunningInstancesForUuid(windowListUUID)[0];
}

function getAllWindows() {
  return getWindowList().manager_container.get_children().map(function(w) {
    return w._delegate;
  });
}

function getWorkspaceWindows() {
  return getAllWindows().filter(function(w) {
    return w.metaWindow.get_workspace() === global.screen.get_active_workspace();
  });
}
