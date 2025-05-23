import React from "react";
import { Input } from "reactstrap";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

export default (props) => {
  const {value, setValue, config, valueFormat, use12Hours, readonly} = props;
  const darkMode = config.settings.themeMode === "dark";

  const onChange = e => {
    let value = e.target.value;
    if (value == "")
      value = undefined;
    else
      value = moment(new Date(value)).format(valueFormat);
    setValue(value);
  };

  let dtValue = value;
  if (!value)
    dtValue = "";
  else
    dtValue = moment(value).format("YYYY-MM-DDTHH:mm");
  
  return (
    <Input
      type="datetime-local"
      bsSize={"sm"}
      value={dtValue}
      disabled={readonly}
      onChange={onChange}
      className={darkMode ? "bg-dark text-light border-dark color-scheme-dark" : undefined}
    />
  );
};
