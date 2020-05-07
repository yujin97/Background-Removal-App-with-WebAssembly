import React from 'react';
import './backendControl.css'

const BackendControl = ( { backendChange } ) => {
	return (
		<div id = "backendControl">
			<p>Backend Option</p>
 			<select id="backend" onChange = { backendChange }>
  				<option value="wasm">wasm</option>
  				<option value="webgl">webgl</option>
			</select>
		</div>
		);
}

export default BackendControl;