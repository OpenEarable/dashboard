import * as config from "../../config.js";



export class Player {
    constructor(inter) {
        this.interface = inter;
        this.start_button = document.getElementById('play_Button');
        this.stop_button = document.getElementById('stop_Button');
        this.pause_button = document.getElementById('pause_Button');
        this.unpause_button = document.getElementById('unpause_Button');

        this.check_box = document.getElementById('unpause_Button');
        this.file_input = document.getElementById('file_input');

        this.init_buttons();
    }

    init_buttons() {
        this.start_button.addEventListener('click', (event) => {
            this.press_start();
        });

        this.stop_button.addEventListener('click', (event) => {
            this.press_stop();
        });

        this.pause_button.addEventListener('click', (event) => {
            this.press_pause();
        });

        this.unpause_button.addEventListener('click', (event) => {
            this.press_unpause();
        });
    }


    get_name() {
        return this.file_input.value
    }

    get_name_checked() {
        return this.check_box.checked
    }

    press_start() {
        this.send_config(1);
    }

    press_stop() {
        this.send_config(0);
    }

    press_pause() {
        this.send_config(2);
    }

    press_unpause() {
        this.send_config(3);
    }

    send_config(number) {
        let text, config;
        text = "";
        if (this.get_name_checked()) text = this.get_name();
        config = [number, text.length, text];
        this.interface.send_wav_name(config);
    }
}