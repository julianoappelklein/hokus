import { darkBaseTheme, getMuiTheme, lightBaseTheme } from "material-ui/styles";
import { deepOrange500 } from "material-ui/styles/colors";

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
  datePicker: datePicker
});
export const darkMuiTheme = getMuiTheme(darkBaseTheme, {
  palette: themePalette,
  datePicker: datePicker
});
