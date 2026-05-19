import useAutocomplete from "@mui/material/useAutocomplete";
import PropTypes from "prop-types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { autocompleteClasses } from "@mui/material/Autocomplete";

const Root = styled("div")(({ theme }) => ({
  fontSize: "14px",
}));

const Label = styled("label")`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  border: "1px solid #d9d9d9",
  backgroundColor: "#fff",
  borderRadius: "4px",
  padding: "1px",
  display: "flex",
  flexWrap: "wrap",
  minHeight: "35px",
  alignItems: "center",

  "& input": {
    height: "35px",
    padding: "4px 6px",
    flexGrow: 1,
    border: 0,
    outline: 0,
    fontSize: "14px",
  },
}));

const ChipItem = styled("div")`
  display: flex;
  align-items: center;
  height: 26px;
  margin: 2px;
  padding: 0 6px;
  background: #f0f0f0;
  border-radius: 4px;

  & span {
    margin-right: 4px;
  }
  & svg {
    cursor: pointer;
    font-size: 16px;
  }
`;

const Listbox = styled("ul")`
  width: 100%;
  position: absolute;
  z-index: 10;
  background: #fff;
  list-style: none;
  padding: 0;
  margin-top: 4px;
  max-height: 250px;
  overflow: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px #0003;

  & li {
    padding: 6px 12px;
    display: flex;
    align-items: center;
  }
  & li svg {
    margin-left: auto;
    opacity: 0;
  }
  & li[aria-selected="true"] svg {
    opacity: 1;
  }
  & li.${autocompleteClasses.focused} {
    background: #e6f7ff;
    cursor: pointer;
  }
`;

function CustomMultiSelect(props) {
  console.log("props123 = ",props);
  
  // const {
  //   getRootProps,
  //   getInputLabelProps,
  //   getInputProps,
  //   getListboxProps,
  //   getOptionProps,
  //   getItemProps,
  //   groupedOptions,
  //   value,
  //   focused,
  //   setAnchorEl,
  // } = useAutocomplete({
  //   multiple: true,
  //   ...props,
  // });
  const {
  getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    getItemProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
} = useAutocomplete({
  multiple: true,
  options: props.options || [],
  value: props.value || [],
  getOptionLabel: props.getOptionLabel,
  isOptionEqualToValue: (opt, val) => opt.key === val.key,
  onChange: (event, newValue) => props.onChange(event, newValue),
});


  console.log("ppp111 value = ",value);

  

  return (
    <Root>
      {props.label && <Label {...getInputLabelProps()}>{props.label}</Label>}

      <InputWrapper ref={setAnchorEl} className={focused ? "focused" : ""}>
        {value.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return (
            <ChipItem key={key} {...itemProps}>
              <span>{props?.getOptionLabel(option)}</span>
              {/* <CloseIcon
                onClick={() => props?.onChange(value.filter((v) => v !== option))}
              /> */}
              <CloseIcon
  onClick={() =>
    props.onChange(null, value.filter(v => v.key !== option.key))
  }
/>

            </ChipItem>
          );
        })}

        <input {...getInputProps()} placeholder={props?.placeholder} />
      </InputWrapper>

      {groupedOptions?.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {groupedOptions.map((option, index) => {
            const { key, ...optionProps } = getOptionProps({ option, index });

            return (
              <li key={key} {...optionProps}>
                <span>{props?.getOptionLabel(option)}</span>
                <CheckIcon />
              </li>
            );
          })}
        </Listbox>
      ) : null}
    </Root>
  );
}

CustomMultiSelect.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  getOptionLabel: PropTypes.func,
  onChange: PropTypes.func,
};

export default CustomMultiSelect;
