import { darkBaseTheme, getMuiTheme, lightBaseTheme } from "material-ui/styles";
import {
  indigo500,
  indigo700,
  indigo900,
  deepPurple700,
  blue500,
  blue400,
  blue300,
  deepPurple300,
  deepPurple500,
  deepOrange700,
  deepOrange500,
  deepOrange300,
  pink500,
  deepOrange400
} from "material-ui/styles/colors";

const themePalette = {
  primary1Color: "#2a0d56",
  // primary2Color: '#370d77',
  // primary3Color: '#4c179c',
  accent1Color: deepOrange500
  // accent2Color: deepOrange400,
  // accent3Color: deepOrange300,
};

const datePicker = {
  selectColor: themePalette.primary1Color,
  headerColor: themePalette.primary1Color
};

export const lightMuiTheme = getMuiTheme(lightBaseTheme, {
  palette: themePalette,
  datePicker: datePicker,
});
export const darkMuiTheme = getMuiTheme(darkBaseTheme, {
  palette: themePalette,
  datePicker: datePicker
});
