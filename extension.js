/** extension.js
 * MIT License
 * Copyright © 2023 Aliaksei Zhuk
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * SPDX-License-Identifier: MIT
 */

/**
 Debug with:
 dbus-run-session -- gnome-shell --nested --wayland
*/

const {Clutter, GObject, St} = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;

// https://gitlab.gnome.org/GNOME/gnome-shell/blob/main/js/misc/extensionUtils.js
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Misc = Me.imports.misc;
const Timer = Me.imports.timer;

const Indicator = GObject.registerClass(class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Toggle Button');

        this.timer = new Timer.Timer();

        this._label = new St.Label({
            text: '0:00', y_align: Clutter.ActorAlign.CENTER, style_class: 'paused'
        });
        this.add_child(this._label);

        this.connect('event', this._onClick.bind(this));
    }

    _onClick(actor, event) {
        if (event.type() !== Clutter.EventType.BUTTON_RELEASE) {
            // Some other non-clicky event happened; bail
            return Clutter.EVENT_PROPAGATE;
        }

        switch (event.get_button()) {
            case 3: // left
                this.timer.stop();
                this._updateLabel();

                this._label.set_style_class_name('paused');

                MainLoop.source_remove(this.timeout);
                this.timeout = null;

                break;
            case 1: // right
                if (this.timer.isRunning()) {
                    this.timer.pause();

                    this._label.set_style_class_name('paused');
                } else {
                    if (this.timer.isPaused()) {
                        this.timer.resume();
                    } else { // stopped
                        this.timer.start();
                    }

                    this.timeout = MainLoop.timeout_add(1000, () => {
                        this.timer.update();
                        this._updateLabel();

                        return true;
                    });

                    this._label.set_style_class_name('normal');
                }

                break;
        }

        return Clutter.EVENT_PROPAGATE;
    }

    // Updates the timer-label with the current time left.
    _updateLabel() {
        this._label.set_text(Misc.formatTime(this.timer.timePassed));
    }

    destroy() {
        if (this.timeout) {
            MainLoop.source_remove(this.timeout);
            this.timeout = null;
        }
        super.destroy();
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();

        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
