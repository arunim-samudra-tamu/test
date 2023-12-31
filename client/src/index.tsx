import "semantic-ui-css/semantic.min.css";

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { unregister } from "./serviceWorker";

ReactDOM.render(

	// according to this PayPal issue, remove the strict mode
	// https://github.com/Luehang/react-paypal-button-v2/issues/126

	// <React.StrictMode>
		<App />,
	// </React.StrictMode>,
	document.getElementById("root")
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
