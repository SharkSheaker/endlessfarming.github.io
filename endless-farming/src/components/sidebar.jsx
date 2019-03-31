import React, { Component } from "react";
import { slide as Menu } from "react-burger-menu";

import "normalize.css";
import "./sidebar.css";
import PetDropdown from "./petDropdown";

class SideBar extends Component {
  render() {
    return (
      <Menu width={200} isOpen={this.props.open}>
        <a id="home" className="menu-item" href="/">
          Home
        </a>
        <PetDropdown />
        <a id="units" className="menu-item" href="/contact">
          Units
        </a>
        <a id="tickets" className="menu-item" href="/contact">
          Tickets
        </a>
        <a id="metas" className="menu-item" href="/contact">
          Metas
        </a>
      </Menu>
    );
  }
}

export default SideBar;
