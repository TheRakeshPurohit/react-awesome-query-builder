import moment from "moment";
import { expect } from "chai";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_material, hexToRgbString } from "../support/utils";

const {
  with_theme_material,
  with_all_types,
} = configs;

const ignoreLogDatePicker = (errText: string) => {
  return errText.includes("The `anchorEl` prop provided to the component is invalid")
    || errText.includes("The `fade` color utility was renamed to `alpha` to better describe its functionality");
};

describe("material-ui theming", () => {
  it("applies secondary color", async () => {
    await with_qb_material([with_all_types, with_theme_material], inits.with_bool, "JsonLogic", (qb) => {
      const boolSwitch = qb.find(".rule--value .MuiSwitch-thumb");
      expect(boolSwitch, "boolSwitch").to.have.length(1);
      const boolSwitchNode = boolSwitch.at(0).getDOMNode() ;
      const boolSwitchStyle = getComputedStyle(boolSwitchNode);
      expect(boolSwitchStyle.getPropertyValue("color"), "boolSwitch color").to.eq(hexToRgbString("#edf2ff"));
    }, {
      attach: true
    });
  });
});

describe("material-ui widgets interactions", () => {

  it("change date", async () => {
    await with_qb_material(configs.with_date_and_time, inits.with_date_and_time, "JsonLogic", (qb, {expect_jlogic}) => {
      // open date picker for '2020-05-18'
      const openPickerBtn = qb.find(".rule--widget--DATE button.MuiIconButton-root");
      expect(openPickerBtn, "openPickerBtn").to.have.length(1);
      openPickerBtn.simulate("click");

      // click on 3rd week, 2nd day of week (should be sunday, 10 day for default US locale)
      const dayBtn = document.querySelector<HTMLElement>(
        ".MuiDialog-root" 
        + " .MuiPickersCalendar-week:nth-child(3)" 
        + " > div:nth-child(2)" 
        + " .MuiPickersDay-day"
      );
      expect(dayBtn, "dayBtn").to.exist;
      expect(dayBtn?.innerText, "dayBtn").to.eq("11");
      dayBtn?.click();

      // click ok
      const okBtn = document.querySelector<HTMLElement>(
        ".MuiDialog-root" 
        + " .MuiDialogActions-root" 
        + " .MuiButton-root:nth-child(2)"
      );
      expect(okBtn, "okBtn").to.exist;
      okBtn?.click();

      // now input should be '2020-05-11'
      const dateInput = qb.find(".rule--widget--DATE input.MuiInput-input");
      expect(dateInput, "dateInput").to.have.length(1);
      const dateInputValue = dateInput.getDOMNode().getAttribute("value");
      expect(dateInputValue, "dateInputValue").to.eq("11.05.2020");

      expect_jlogic([null,
        {
          "or": [{
            "datetime==": [ { "var": "datetime" }, "2020-05-18T21:50:01.000Z" ]
          }, {
            "and": [{
              "date==": [ {  "var": "date" }, "2020-05-11T00:00:00.000Z" ]
            }, {
              "==": [ { "var": "time" }, 3000 ]
            }]
          }]
        }
      ]);
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });

  it("change time value", async () => {
    await with_qb_material(configs.with_all_types, inits.with_time, "JsonLogic", (qb, {expect_jlogic}) => {
      const {onChange: onChangeDate} = qb
        .find("KeyboardDateInput")
        .props();
      // @ts-ignore
      onChangeDate(moment("0001-01-01 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ]);
    }, {
      ignoreLog: ignoreLogDatePicker,
    });
  });
});

describe("material-ui IconButton accessibility - aria-label", () => {
  // When deleteLabel is defined it is used as the aria-label for icon buttons
  it("delete button label is used as aria-label", async () => {
    await with_qb_material(configs.with_modified_delete_label,
      inits.with_number,
      "JsonLogic",
      () => {
        const deleteBtn = document.querySelector<HTMLElement>(
          ".rule--header .MuiIconButton-root" 
        );
        expect(deleteBtn, "deleteBtn").to.exist;
        const ariaLabel = deleteBtn?.getAttribute("aria-label");
        expect(ariaLabel).to.eq("Delete rule");
      }
    );
  });

  // When deleteLabel is not defined icon buttons do not have an aria-label
  it("delete button with no label defined has no aria-label", async () => {
    await with_qb_material(configs.with_no_delete_label,
      inits.with_number,
      "JsonLogic",
      () => {
        const deleteBtn = document.querySelector<HTMLElement>(
          ".rule--header .MuiIconButton-root" 
        );
        expect(deleteBtn, "deleteBtn").to.exist;
        expect(deleteBtn?.hasAttribute("aria-label")).to.eq(false);
      }
    );
  });
});

describe("material-ui Autocomplete accessibility - aria-label", () => {
  // Autocomplete uses fieldPlaceholder from config as the aria-label
  it("fieldPlaceholder is used as aria-label", async () => {
    await with_qb_material(configs.with_modified_field_placeholder,
      inits.with_number,
      "JsonLogic",
      () => {
        const fieldCombo = document.querySelector<HTMLElement>(
          ".rule--field .MuiAutocomplete-input"
        );
        expect(fieldCombo, "field combobox").to.exist;
        const ariaLabel = fieldCombo?.getAttribute("aria-label");
        expect(ariaLabel).to.eq("autocomplete placeholder");
      }
    );
  });

  // When fieldPlaceholder is not defined Autocompletes do not have an aria-label
  it("select field combobox has no aria-label when fieldPlaceholder is not defined", async () => {
    await with_qb_material(configs.with_no_field_placeholder,
      inits.with_number,
      "JsonLogic",
      () => {
        const fieldCombo = document.querySelector<HTMLElement>(
          ".rule--field .MuiAutocomplete-input"
        );
        expect(fieldCombo, "field combobox").to.exist;
        expect(fieldCombo?.hasAttribute("aria-label")).to.eq(false);
      }
    );
  });
});
