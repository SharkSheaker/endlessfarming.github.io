import React, { Component } from "react";
import user from "./user-solid.svg";
import {
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

class NavBar extends Component {
  state = { dropdown: false };

  handleDropdownToggle = () => {
    this.setState({
      dropdown: !this.state.dropdown
    });
  };

  render() {
    return (
      <nav className="navbar navbar-dark bg-dark">
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => this.props.onBurger()}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <Dropdown
          isOpen={this.state.dropdown}
          toggle={this.handleDropdownToggle}
        >
          <DropdownToggle nav caret>
            <img src={user} width="30" height="30" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem href="#">Import</DropdownItem>
            <DropdownItem href="#">Settings</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </nav>
    );
  }
}

export default NavBar;
