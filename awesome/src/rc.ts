// import "awful.remote";

import * as awful from 'awful';
import * as menubar from 'menubar';
import * as naughty from 'naughty';

import { Direction, ModifierKey } from 'awesomewm.4.3.ts.d';
import { clientButtons, clientKeys } from './client';
import { filesystem as fs, table } from 'gears';
import { launchApps, range } from './utils';
import { spawn, tag } from 'awful';

import { Screen } from 'awesomewm.4.3.ts.d/awesomewm/awful/screen';
import { config } from './config';
import { option } from './option';

if (awesome.startup_errors) {
  naughty.notify({
    preset: naughty.config.presets.critical,
    title: 'Oops, there were errors during startup!',
    text: awesome.startup_errors,
  });
}

let in_error = false;
awesome.connect_signal('debug::error', (err) => {
  if (!in_error) {
    in_error = true;
    naughty.notify({
      preset: naughty.config.presets.critical,
      title: 'Oops, an error happened!',
      text: err.toString(),
    });
  }
});

launchApps(config.startupApps);

// Focus client on hover
client.connect_signal('mouse::enter', (it) => {
  if (awful.client.focus.filter(it)) {
    client.focus = it;
  }
});

const modkey = config.modkey;

awful.layout.layouts = config.layouts;

menubar.utils.terminal = config.apps.terminal;

const globalKeys = table.join<awful.Key<Screen>>(
  awful.key<Screen>([modkey], 'Prior', tag.viewprev, {
    description: 'view previous',
    group: 'tag',
  }),
  awful.key<Screen>([modkey], 'Next', tag.viewnext, {
    description: 'view next',
    group: 'tag',
  }),
  awful.key<Screen>([modkey], 'Escape', tag.history.restore, {
    description: 'go back',
    group: 'tag',
  }),
  awful.key([modkey], 'Left', () => awful.client.focus.bydirection(Direction.Left), {
    description: 'focus left',
    group: 'client',
  }),
  awful.key([modkey], 'Right', () => awful.client.focus.bydirection(Direction.Right), {
    description: 'focus right',
    group: 'client',
  }),
  awful.key([modkey], 'Up', () => awful.client.focus.bydirection(Direction.Up), {
    description: 'focus up',
    group: 'client',
  }),
  awful.key([modkey], 'Down', () => awful.client.focus.bydirection(Direction.Down), {
    description: 'focus down',
    group: 'client',
  }),
  awful.key(
    [modkey, ModifierKey.Mod1],
    'Left',
    () => awful.client.swap.bydirection(Direction.Left),
    {
      description: 'swap with left client',
      group: 'client',
    },
  ),
  awful.key(
    [modkey, ModifierKey.Mod1],
    'Right',
    () => awful.client.swap.bydirection(Direction.Right),
    {
      description: 'swap with right client',
      group: 'client',
    },
  ),
  awful.key([modkey, ModifierKey.Mod1], 'Up', () => awful.client.swap.bydirection(Direction.Up), {
    description: 'swap with up client',
    group: 'client',
  }),
  awful.key(
    [modkey, ModifierKey.Mod1],
    'Down',
    () => awful.client.swap.bydirection(Direction.Down),
    {
      description: 'swap with down client',
      group: 'client',
    },
  ),
  awful.key(
    [modkey, ModifierKey.Control],
    'Left',
    () => awful.screen.focus_bydirection(Direction.Left, awful.screen.focused() as Screen),
    {
      description: 'focus left screen',
      group: 'screen',
    },
  ),
  awful.key(
    [modkey, ModifierKey.Control],
    'Right',
    () => awful.screen.focus_bydirection(Direction.Right, awful.screen.focused() as Screen),
    {
      description: 'focus right screen',
      group: 'screen',
    },
  ),
  awful.key(
    [modkey, ModifierKey.Control],
    'Up',
    () => awful.screen.focus_bydirection(Direction.Up, awful.screen.focused() as Screen),
    {
      description: 'focus up screen',
      group: 'screen',
    },
  ),
  awful.key(
    [modkey, ModifierKey.Control],
    'Down',
    () => awful.screen.focus_bydirection(Direction.Down, awful.screen.focused() as Screen),
    {
      description: 'focus down screen',
      group: 'screen',
    },
  ),
  awful.key(
    [modkey],
    'Tab',
    () => {
      awful.client.focus.history.previous();
      // option(client.focus).forEach((it) => it.raise());
    },
    { description: 'go back', group: 'client' },
  ),
  awful.key([modkey], 'Return', () => awful.spawn(config.apps.terminal), {
    description: 'open a terminal',
    group: 'launcher',
  }),
  awful.key([modkey, ModifierKey.Control], 'r', awesome.restart, {
    description: 'reload awesome',
    group: 'awesome',
  }),
  awful.key([modkey, ModifierKey.Shift], 'q', () => awesome.quit(), {
    description: 'quit',
    group: 'awesome',
  }),
  awful.key([modkey], '=', () => tag.incmwfact(0.05), {
    description: 'increase master width factor',
    group: 'layout',
  }),
  awful.key([modkey], '-', () => tag.incmwfact(-0.05), {
    description: 'decrease master width factor',
    group: 'layout',
  }),
  awful.key([modkey, ModifierKey.Shift], 'h', () => tag.incnmaster(1, null, true), {
    description: 'increase the number of master clients',
    group: 'layout',
  }),
  awful.key([modkey, ModifierKey.Shift], 'l', () => tag.incnmaster(-1, null, true), {
    description: 'decrease the number of master clients',
    group: 'layout',
  }),
  awful.key([modkey, ModifierKey.Control], 'h', () => tag.incncol(1, null, true), {
    description: 'increase the number of columns',
    group: 'layout',
  }),
  awful.key([modkey, ModifierKey.Control], 'l', () => tag.incncol(-1, null, true), {
    description: 'decrease the number of columns',
    group: 'layout',
  }),
  awful.key([modkey], 'space', () => awful.layout.inc(1), {
    description: 'select next',
    group: 'layout',
  }),
  awful.key([modkey, ModifierKey.Shift], 'space', () => awful.layout.inc(-1), {
    description: 'select previous',
    group: 'layout',
  }),
  awful.key(
    [modkey, ModifierKey.Control],
    'n',
    () =>
      option(awful.client.restore()).forEach((it) =>
        it.emit_signal('request::activate', 'key.unminimize', { raise: true }),
      ),
    { description: 'restore minimized', group: 'client' },
  ),
  // TODO: change to start ulauncher up and toggle
  awful.key([modkey], 'd', () => spawn('ulauncher'), {
    description: 'run prompt',
    group: 'launcher',
  }),
  awful.key(
    [modkey],
    'x',
    () =>
      option(awful.screen.focused()).forEach((it) =>
        awful.prompt.run({
          prompt: 'Run Lua code: ',
          textbox: it.myPromptBox.widget,
          exe_callback: awful.util.eval,
          history_path: `${fs.get_cache_dir()}/history_eval`,
        }),
      ),
    { description: 'lua execute prompt', group: 'awesome' },
  ),
  awful.key([modkey], 'p', () => spawn('rofi -show combi'), {
    description: 'show the menubar',
    group: 'launcher',
  }),
  awful.key([modkey], 'w', () => spawn('google-chrome-stable')),
  awful.key(
    [modkey],
    'u',
    () =>
      option(mouse.current_client).forEach((it) =>
        it.emit_signal('request::activate', 'undermouse', { raise: false }),
      ),
    {
      description: 'focus client under mouse',
      group: 'client',
    },
  ),
);

awful.rules.rules = [
  {
    rule: {},
    properties: {
      // border_width: beautiful.border_width,
      // border_color: beautiful.border_normal,
      focus: awful.client.focus.filter,
      raise: true,
      keys: clientKeys,
      buttons: clientButtons,
      screen: awful.screen.preferred,
      placement: awful.placement.no_offscreen,
    },
  },
  {
    rule: {
      floating: true,
    },
    properties: {
      border_width: 0,
    },
  },
  {
    rule_any: {
      type: ['dialog'],
      class: [
        'Wicd-client.py',
        'calendar.google.com',
        'Blueman-manager',
        'Sxiv',
        'Caja',
        'org.gnome.Nautilus',
        'Org.gnome.Nautilus',
        'gcr-prompter',
        'Zoom',
      ],
      name: ['Chat'],
    },
    properties: {
      focus: true,
      floating: true,
      above: true,
      titlebars_enabled: true,
      placement: awful.placement.centered,
    },
  },
  {
    rule_any: {
      class: ['ulauncher', 'Ulauncher'],
      name: ['Ulauncher - Application Launcher'],
    },
    properties: {
      focus: true,
      floating: true,
      above: true,
      titlebars_enabled: false,
      placement: awful.placement.centered,
    },
  },
  {
    rule_any: { type: ['normal', 'dialog'] },
    properties: { titlebars_enabled: true },
  },
];

root.keys(globalKeys);

const tagKeys = range(1, 9)
  .map((tagName) =>
    table.join<awful.Key<Screen>>(
      awful.key(
        [modkey],
        `#${tagName + 9}`,
        () =>
          option(awful.screen.focused())
            .andThen((it) => it.tags[tagName - 1])
            .forEach((it) => it.view_only()),
        { description: `toggle tag #${tagName}`, group: 'tag' },
      ),
      awful.key(
        [modkey, ModifierKey.Control],
        `#${tagName + 9}`,
        () =>
          option(awful.screen.focused())
            .andThen((it) => it.tags[tagName - 1])
            .forEach(tag.viewtoggle),
        { description: `toggle tag #${tagName}`, group: 'tag' },
      ),
      awful.key(
        [modkey, ModifierKey.Shift],
        `#${tagName + 9}`,
        () =>
          option(awful.screen.focused())
            .andThen((it) => it.tags[tagName - 1])
            .zipMap(option(client.focus))((t, c) => c.move_to_tag(t)),
        { description: `move focused client to tag #${tagName}`, group: 'tag' },
      ),
      awful.key(
        [modkey, ModifierKey.Shift, ModifierKey.Control],
        `#${tagName + 9}`,
        () =>
          option(awful.screen.focused())
            .andThen((it) => it.tags[tagName - 1])
            .zipMap(option(client.focus))((t, c) => c.toggle_tag(t)),
        {
          description: `toggle focused client on tag #${tagName}`,
          group: 'tag',
        },
      ),
    ),
  )
  .reduce((a, b) => table.join(a, b));

root.keys(table.join(globalKeys, tagKeys));

awful.screen.connect_for_each_screen((screen) => {
  awful.tag(
    range(1, 9).map((num) => num.toString(10)),
    screen,
    awful.layout.layouts[0],
  );
});
