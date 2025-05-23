import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";

export default ({ items, setField, selectedKey, readonly, placeholder, errorText, config }) => {
  const darkMode = config.settings.themeMode === "dark";
  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem",
  };

  const stylesDropdownMenuWrapper = {
    overflowY: "auto",
    maxHeight: "400px",
  };

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setField(e.target.value);
  };

  const renderOptions = (fields, isGroupItem = false, level = 0) =>
    Object.keys(fields).map((fieldKey) => {
      const field = fields[fieldKey];
      const { items, path, label, disabled, matchesType } = field;
      const groupPrefix = level > 0 ? "\u00A0\u00A0".repeat(level) : "";
      const prefix = level > 1 ? "\u00A0\u00A0".repeat(level-1) : "";
      if (items) {
        return (
          <div key={`dropdown-itemGroup-${path}`}>
            <DropdownItem
              header
              key={`${path}-header`}
              onClick={onChange}
              value={path}
            >
              {groupPrefix+label}
            </DropdownItem>
            {renderOptions(items, true, level+1)}
          </div>
        );
      } else {
        const itemText = matchesType ? <b>{prefix+label}</b> : prefix+label;
        return (
          <DropdownItem
            disabled={disabled}
            key={path}
            onClick={onChange}
            value={path}
            className={isGroupItem ? "px-4" : undefined}
            active={selectedKey == path}
          >
            {itemText}
          </DropdownItem>
        );
      }
    });

  const hasValue = selectedKey != null;

  const renderNotSelected = () => {
    const text = placeholder || errorText || "&nbsp;";
    if (errorText) {
      return (<span style={{color: "red"}}>{text}</span>);
    }
    return (<span>{text}</span>);
  };

  const renderSelected = (allItems, selectedKey) => {
    if (!readonly && !selectedKey) return placeholder;
    
    const _find = (subItems) => {
      for (const k in subItems) {
        const item = subItems[k];
        if (item.path === selectedKey) {
          return item;
        }
        if (item.items) {
          const maybeFound = _find(item.items);
          if (maybeFound) {
            return maybeFound;
          }
        }
      }
    };
    return _find(allItems)?.label || selectedKey;
  };

  return (
    <Dropdown
      isOpen={!readonly && isOpen}
      onClick={() => (!isOpen ? setIsOpen(true) : setIsOpen(false))}
      disabled={readonly}
      toggle={() => setIsOpen(!isOpen)}
    >
      <DropdownToggle
        tag={!darkMode ? "button" : undefined}
        caret={darkMode}
        className={"form-select"}
        style={stylesDropdownWrapper}
        color={darkMode ? "dark" : "transparent"}
        disabled={readonly}
      >
        {hasValue ? renderSelected(items, selectedKey) : renderNotSelected()}
      </DropdownToggle>
      <DropdownMenu 
        container={"body"}
        style={stylesDropdownMenuWrapper}
        dark={darkMode}
      >
        {!hasValue && <DropdownItem key={"body"} disabled value={""}></DropdownItem>}
        {renderOptions(items)}
      </DropdownMenu>
    </Dropdown>
  );
};
