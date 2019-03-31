import React, { Component } from "react";
import {
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

class PetDropdown extends Component {
  state = { dropdown: false };

  handleDropdownToggle = () => {
    this.setState({
      dropdown: !this.state.dropdown
    });
  };

  render() {
    return (
      <Dropdown isOpen={this.state.dropdown} toggle={this.handleDropdownToggle}>
        <DropdownToggle nav caret>
          Pets
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem href="#">Normal</DropdownItem>
          <DropdownItem href="#">Hard</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default PetDropdown;
