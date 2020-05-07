import React from 'react';
import './arControl.css'

const ArControl = ( { arSwitch } ) => {
	return (
		<div id = "arControlContainer">
			<p>AR Effect</p>
 			<input type="checkbox" id="ar1" name="ar1" value="head" onChange = { arSwitch }/>
			<label htmlFor="ar1"> Head Replacement</label><br/>
			<input type="checkbox" id="ar2" name="ar2" value="eye1" onChange = { arSwitch }/>
			<label htmlFor="ar2"> Sunglasses Effect</label><br/>
			<input type="checkbox" id="ar3" name="ar3" value="mask" onChange = { arSwitch }/>
			<label htmlFor="ar3"> Mask Effect</label><br/>
			<br/>
		</div>
		);
}

export default ArControl;