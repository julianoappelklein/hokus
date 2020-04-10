import AccordionDynamic from "./AccordionDynamic";
import AceDynamic from "./AceDynamic";
//import ArrayDynamic from "./ArrayDynamic";
import ChipsDynamic from "./ChipsDynamic";
import { DataNestDynamic } from "./../../HoForm/DataNestDynamic";
import DateDynamic from "./DateDynamic";
import EmptyLineDynamic from "./EmptyLineDynamic";
import { ExtendDynamic } from "./../../HoForm/ExtendDynamic";
import { HiddenDynamic } from "./../../HoForm/HiddenDynamic";
import { IncludeDynamic } from "./../../HoForm/IncludeDynamic";
import InfoDynamic from "./InfoDynamic";
import LeafArrayDynamic from "./LeafArrayDynamic";
import MarkdownDynamic from "./MarkdownDynamic";
import NestDynamic from "./NestDynamic";
import PullDynamic from "./PullDynamic";
import TextFieldDynamic from "./TextFieldNumberDynamic";
import TextFieldNumberDynamic from "./TextFieldDynamic";
import ToggleDynamic from "./ToggleDynamic";
import ReadonlyDynamic from "./ReadonlyDynamic";
import BundleManagerDynamic from "./BundleManagerDynamic";
import SectionDynamic from "./SectionDynamic";
import SelectDynamic from "./SelectDynamic";
import BundleImgThumbDynamic from "./BundleImgThumbDynamic";
import { ComponentProps } from "react";
import * as React from "react";
import DateTimeDynamic from "./DateTimeDynamic";

// Explicitly specify type so the compiler can help.
const allComponents: Array<React.ComponentClass<ComponentProps<any>, any>> = [
  AccordionDynamic,
  AceDynamic,
  // ArrayDynamic,
  BundleImgThumbDynamic,
  ChipsDynamic,
  DataNestDynamic,
  DateDynamic,
  DateTimeDynamic,
  ExtendDynamic,
  EmptyLineDynamic,
  LeafArrayDynamic,
  HiddenDynamic,
  IncludeDynamic,
  InfoDynamic,
  MarkdownDynamic,
  NestDynamic,
  PullDynamic,
  ReadonlyDynamic,
  BundleManagerDynamic,
  SectionDynamic,
  SelectDynamic,
  TextFieldDynamic,
  TextFieldNumberDynamic,
  ToggleDynamic
];
export default allComponents;
