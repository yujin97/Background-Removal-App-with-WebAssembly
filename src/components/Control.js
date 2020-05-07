import React from 'react';
import './control.css'

const Control = ( { changeMode } ) => {
	return (
		<div id = "controlContainer">
			<p>Removal Mode</p>
 			<input type="radio" id="mode-1" name="mode" value= "1" onChange = { changeMode }/>
			<label htmlFor="Remove">Background Remove</label><br/>
			<input type="radio" id="mode-2" name="mode" value= "2" onChange = { changeMode }/>
			<label htmlFor="Replace">Background Replace</label><br/>
			<br/>
		</div>
		);
}

export default Control;