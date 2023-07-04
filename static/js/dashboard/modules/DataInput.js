import * as config from "../../config.js";

let PDM_Rates = [
    0,
    16000,
    41667,
    62500
];

// Sensor ID => HTML ID
let sensor_id_map = {
    0: 0,
    1: 1,
    3: 2,
    4: 3,
    2: 4,
    5: 5
};

export class DataInput {
    constructor(inter) {
        this.interface = inter;
        this.config_button = document.getElementById('configButton');
        this.default_button = document.getElementById('defaultButton');
        this.stop_button = document.getElementById('stopButton');

        this.inputs = {};
        this.input_count = 6;
        this.select_id = 5;

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
            let element = new SensorInput(i, i === this.select_id)
            let sensor_id = sensor_id_map[i];
            this.inputs[sensor_id] = element;
        }
    }

    press_default() {
        config.SENS_DEFAULT.forEach((config, index) => {
            let [sensor_id, rate] = config;
            this.inputs[sensor_id].set(rate);
        });
    }

    press_config() {
        for (const [sensor_id, input] of Object.entries(this.inputs)) {
            if (!input.checked()) continue;
            let value = input.get();

            let config = [sensor_id, value];
            this.interface.configure(config);
        }
    }

    press_stop() {
        for (const [sensor_id, input] of Object.entries(this.inputs)) {
            let config = [sensor_id, 0];
            this.interface.configure(config);
        }
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
            if (!PDM_Rates.includes(value)) {
                return;
            }
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
        let options = Array.from(this.element.options);
        let optionToSelect = options.find(item => item.value === String(value));
        optionToSelect.selected = true;
    }
}
