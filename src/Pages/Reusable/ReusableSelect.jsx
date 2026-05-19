import React, {useState,useRef, useEffect} from "react";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export default function ReusableSelect({
  options = [],
  placeholder = "Select...",
  width = '100%',
  value = null, // object or array of objects
  onChange,
  isMulti = false,
  onClose = null,
}) {
  const theme = useTheme();
  const selectRef = useRef();
  const [menuWidth, setMenuWidth] = useState(150);
  // console.log('selectRef:::::',selectRef.current.offsetWidth)
const MenuProps = {
  PaperProps: {
    // style: {
    //   maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
    //    width: selectRef.current
    //     ? selectRef.current.offsetWidth
    //     : 150,
    //     maxWidth: 300,
    // },
     style: {
      maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      width: menuWidth,
      maxWidth: 300,
    },
  },
  MenuListProps: {
    sx: {
      '& .MuiMenuItem-root': {
        fontSize: '12px',
        textWrap: 'auto',
      },
      '& .MuiListItemText-root': {
        '& .MuiTypography-root': { fontSize: '12px' },
      },
    },
  },
};
  const selectedValues = isMulti
    ? (value || []).map((v) => v.value)
    : value?.value || "";

  const handleChange = (e) => {
    const selectedValue = e.target.value;

    if (isMulti) {
      const selectedObjects = options.filter((o) =>
        selectedValue.includes(o.value)
      );
      onChange(selectedObjects);
    } else {
      const selectedObject = options.find((o) => o.value === selectedValue);
      onChange(selectedObject || null);
    }
  };

  // Helper to get labels for selected values (array of labels)
  const getSelectedLabels = (selected) => {
    if (!selected) return [];
    if (Array.isArray(selected)) {
      return options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label);
    }
    const found = options.find((o) => o.value === selected);
    return found ? [found.label] : [];
  };

  useEffect(() => {
  if (selectRef.current) {
    setMenuWidth(selectRef.current.offsetWidth);
  }
}, []);

  return (
    <FormControl sx={{ width }}>
      <Select
        multiple={isMulti}
        displayEmpty
        ref={selectRef}
        value={selectedValues}
        onChange={handleChange}
        onClose={onClose}
        input={<OutlinedInput />}
        // style the inner select area so overflow hidden works
        sx={{
          height: "30px",
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            // ensure inner content can be clipped
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            gap: 1,
            fontSize: "12px",
          },
          "& em": {
            color: "#343434",
            fontStyle: "normal",
            opacity: 0.7,
            fontSize: "12px",
          },
        }}
        renderValue={(selected) => {
          const labels = getSelectedLabels(selected);
          const joined = labels.join(", ");

          // Return a clipped inline box — ellipsis will work
          return (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                fontSize: "12px",
              }}
              title={joined} // full text on hover
            >
              {joined.length ? joined : <em>{placeholder}</em>}
            </Box>
          );
        }}
        MenuProps={MenuProps}
      >
        {/* <MenuItem disabled value="">
          <em>{placeholder}</em>
        </MenuItem> */}

        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {isMulti && (
              <Checkbox
                checked={selectedValues.includes(opt.value)}
                size="small"
                sx={{
                  padding: "0px",
                  marginRight: "4px",
                  "& .MuiSvgIcon-root": {
                    fontSize: 14,
                  },
                }}
              />
            )}
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
