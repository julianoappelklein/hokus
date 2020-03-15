import ReactDOM from "react-dom";
import App from "./../App";
import { act } from "react-dom/test-utils";

it('renders without crashing', () => {
  const div = document.createElement('div');
  act(() => {
    ReactDOM.render(<Button>Foo</Button>, div);
  });
});