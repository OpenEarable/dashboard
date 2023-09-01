import * as config from "../../config.js";

let PDM_Rates = [
    0,
    16000,
    41667,
    62500
];

export class DataInput {
    constructor(inter) {
        this.interface = inter;
        this.config_button = document.getElementById('configButton');
        this.default_button = document.getElementById('defaultButton');
        this.stop_button = document.getElementById('stopButton');

        this.inputs = {};
        this.input_count = 3;

        this.init_buttons();
        this.init_inputs();
    }

    init_buttons() {
        this.config_button.addEventListener('click', (event) => {
            this.press_config();
        });

        this.default_button.addEventListener('click', (event) => {
            this.press_default();
        });

        this.stop_button.addEventListener('click', (event) => {
            this.press_stop();
        });
    }

    init_inputs() {
        for (let i = 0; i < this.input_count; i++) {
            this.inputs[i] = new SensorInput(i, true);
        }
    }

    press_default() {
        config.SENS_DEFAULT.forEach((config, index) => {
            let [sensor_id, rate] = config;
            this.inputs[sensor_id].set(rate);
        });
    }

    press_config() {
        let config_num = 0;
        if (this.inputs[0].checked()) {
            config_num += 4 * (3 - this.inputs[0].get());
        } else {
            config_num += 12;
        }
        if (this.inputs[1].checked()) {
            config_num += (4 - this.inputs[1].get());
        } else {
            config_num += 4;
        }
        if (config_num === 16) config_num = 0;

        let audio_info = 0

        if (this.inputs[2].checked()) audio_info = this.inputs[2].get();

        let config = [4, config_num, audio_info];
        this.interface.configure(config);
    }

    press_stop() {
        let config = [4, 0];
        this.interface.configure(config);
    }
}

class SensorInput {
    constructor(id, select= false) {
        this.id = id;
        this.select = select;

        this.check = new Checkbox(id);

        if (select) {
            this.input = new SelectInput(id);
        } else {
            this.input = new NumberInput(id);
        }
    }

    checked() {
        return this.check.get();
    }

    get() {
        return this.input.get();
    }

    set(value) {
        if (this.select) {
            //if (!PDM_Rates.includes(value)) {
            //    return;
            //}
        }
        this.input.set(value);
    }
}

class Checkbox {
    constructor(id) {
        this.name = ["checkbox", id].join("_");
        this.element = document.getElementById(this.name);
    }

    get() {
        return this.element.checked;
    }
}

class NumberInput {
    constructor(id) {
        this.name = ["rate", id].join("_");
        this.element = document.getElementById(this.name);
    }

    get() {
        let value = parseInt(this.element.value);
        if (isNaN(value)) return 0;
        return value;
    }

    set(value) {
        this.element.value = value;
    }
}

class SelectInput {
    constructor(id) {
        this.name = ["select", id].join("_");
        this.element = document.getElementById(this.name);
    }

    get() {
        let value = parseInt(this.element.value);
        if (isNaN(value)) return 0;
        return value;
    }

    set(value) {
        this.element.value = value;
    }
}
