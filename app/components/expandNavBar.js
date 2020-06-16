import React from 'react'
import "./components.css"
import {Link} from 'react-router-dom'
const expandNavBar = () => {
    return(
        <div>
   <nav class="navbar">
<ul class= "navbar-nav">
<li class= "logo">
    <span class= "logo-text">FaceMaker</span>
</li>
<li class="nav-item">
<NavLink to={{pathname:"/"}} class="link">Home</NavLink>
</li>
</ul>

   </nav>
   </div>
      )
    }
  export default expandNavBar