import { uniqueId } from "lodash-es";
import { useMemo, useState } from "react";
import Select, { StylesConfig } from "react-select";

const styles: StylesConfig<any, any, any> = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (_, { isFocused }) => {
    return {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      "-webkit-box-pack": "justify",
      flexShrink: 1,
      transitionProperty:
        "color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-text-decoration-color,-webkit-backdrop-filter",
      transitionDuration: ".2s",
      transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
      minHeight: "3rem",
      padding: "2px 8px",
      fontSize: ".875rem",
      lineHeight: "2",
      borderWidth: "1px",
      borderColor: "hsl(var(--bc)/var(--tw-border-opacity))",
      "--tw-border-opacity": 0,
      "--tw-bg-opacity": 1,
      backgroundColor: " hsl(var(--b1)/var(--tw-bg-opacity))",
      borderRadius: "var(--rounded-btn,.5rem)",
      ...(isFocused && {
        outline: "2px solid hsla(var(--bc)/.2)",
        "outline-offset": "2px",
      }),
    };
  },
  menu: (provider) => {
    return {
      ...provider,
      "--tw-bg-opacity": 1,
      backgroundColor: "hsl(var(--b1)/var(--tw-bg-opacity))",
    };
  },
  singleValue: (provider) => {
    return {
      ...provider,
      color: "inherit",
    };
  },
  placeholder: (provider) => {
    return {
      ...provider,
      color: "#9ca3af",
    };
  },
};

const StyledSelect: typeof Select = (props) => {
  return (
    <Select
      instanceId="styled-select"
      styles={styles}
      menuPortalTarget={global.document?.body}
      {...props}
    />
  );
};

export default StyledSelect;
