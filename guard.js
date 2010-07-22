/*
 * Guard.js - JavaScript API call validation library
 *
 * Copyright (c) 2010 Sergey Ilinsky
 * Licensed under the MIT license.
 *
 */

(function(scope) {
	var fGuard;

	// Function Guard
	(fGuard	= function(aArguments, aParameters) {
		// Validate call to Guard (Extreme, but we are the public library ourselves!)
		// Note! Comment out this validation call once you've learned Guard.js API ;)
		fValidate(fGuard, arguments, [
			["arguments",	fGuard.Arguments],
			["parameters",	Array]
		]);
		// Validate call to public library API function
		return fValidate(aArguments.callee, aArguments, aParameters);
	}).toString	= function() {
		return "function Guard() {\n\t[guard code]\n}";
	};

	// Validation implementation
	function fValidate(fCallee, aArguments, aParameters) {
		// Determine fGuard caller function name
		var sFunction	= String(fCallee).match(rFunction) ? RegExp.$1 : "<anonymous>";
		// Determining API caller function reference
		var fCaller		= null;
		// Has to be wrapped in try/catch because Firebug throws "Permission denied to get property on Function.caller" in XMLHttpRequest
		try {
			fCaller		= fCallee.caller;
		} catch (oError) {}

		// Validate arguments
		for (var nIndex = 0, aParameter, nLength = aArguments.length, vValue, bUndefined, sArgument; aParameter = aParameters[nIndex]; nIndex++) {
			vValue		= aArguments[nIndex];
			bUndefined	= typeof vValue == "undefined";
			sArgument	=(nIndex + 1)+ aEndings[nIndex < 3 ? nIndex : 3];

			// See if argument is missing
			if (bUndefined && !aParameter[2])
				throw new fGuard.Exception(
							fGuard.Exception.ARGUMENT_MISSING_ERR,
							fCaller,
							[sArgument, aParameter[0], sFunction]
				)

			if (nLength > nIndex) {
				if (vValue === null) {
					// See if null is not allowed
					if (!aParameter[3])
						throw new fGuard.Exception(
								fGuard.Exception.ARGUMENT_NULL_ERR,
								fCaller,
								[sArgument, aParameter[0], sFunction]
						)
				}
				else {
					// See if argument has correct type
					if (!fInstanceOf(vValue, aParameter[1]))
						throw new fGuard.Exception(
								fGuard.Exception.ARGUMENT_WRONG_TYPE_ERR,
								fCaller,
								[sArgument, aParameter[0], sFunction, String(aParameter[1]).match(rFunction) ? RegExp.$1 : "<unknown>", bUndefined ? "undefined" : String(fTypeOf(vValue)).match(rFunction) ? RegExp.$1 : "<unknown>"]
						)
				}
			}
		}
	};

	// Public API function
	(fGuard.instanceOf	= function(vValue, cType) {
		// Validate own call (we call fValidate here directly instead of fGuard as we are sure we pass proper arguments!)
		fValidate(fGuard.instanceOf, arguments, [
				["value",	Object],
				["type",	Function]
		]);
		// Invoke
		return fInstanceOf(vValue, cType);
	}).toString	= function() {
		return "function instanceOf() {\n\t[guard code]\n}";
	};

	function fInstanceOf(vValue, cType) {
		// Primitive types
		if (cType == String) {
			if (typeof vValue == "string")
				return true;
		}
		else
		if (cType == Boolean) {
			if (typeof vValue == "boolean")
				return true;
		}
		else
		if (cType == Number) {
			if (typeof vValue == "number")
				return !isNaN(vValue);
		}
		// Special type Guard.Arguments (pseudo type for JavaScript arguments object)
		else
		if (cType == fGuard.Arguments) {
			return typeof vValue == "object" && "callee" in vValue;
		}
		// Complex types
		return cType == Object ? true : vValue instanceof cType;
	};

	(fGuard.typeOf	= function(vValue) {
		// Validate own call (we call fValidate here directly instead of fGuard as we are sure we pass proper arguments!)
		fValidate(fGuard.instanceOf, arguments, [
				["value",	Object]
		]);
		// Invoke
		return fTypeOf(vValue);
	}).toString	= function() {
		return "function typeOf() {\n\t[guard code]\n}";
	};

	function fTypeOf(vValue) {
		if (typeof vValue == "string")
			return String;
		else
		if (typeof vValue == "boolean")
			return Boolean;
		else
		if (typeof vValue == "number")
			return Number;
		else
		if (typeof vValue == "object" && "callee" in vValue)
			return fGuard.Arguments;
		else
			return vValue.constructor;
	};

	// Function Guard.Exception
	(fGuard.Exception	= function(nException, fCaller, aArguments) {
		this.code	= nException;
		this.message= fFormat(fGuard.Exception.messages[nException], aArguments);
		this.caller	= fCaller;
	}).toString	= function() {
		return "function Exception() {\n\t[guard code]\n}";
	};

	fGuard.Exception.ARGUMENT_MISSING_ERR		= 1;
	fGuard.Exception.ARGUMENT_WRONG_TYPE_ERR	= 2;
	fGuard.Exception.ARGUMENT_NULL_ERR			= 3;

	fGuard.Exception.prototype.code		= null;
	fGuard.Exception.prototype.message	= null;
	fGuard.Exception.prototype.caller	= null;

	fGuard.Exception.prototype.toString	= function() {
		return "[Exception... " + this.message + " code:" + this.code + " caller:" + this.caller + "]";
	};

	fGuard.Exception.messages	= {};
	fGuard.Exception.messages[fGuard.Exception.ARGUMENT_MISSING_ERR]	= 'Missing %0 required argument "%1" in "%2" function call.';
	fGuard.Exception.messages[fGuard.Exception.ARGUMENT_WRONG_TYPE_ERR]	= 'Incompatible type of %0 argument "%1" in "%2" function call. Expected "%3", got "%4".';
	fGuard.Exception.messages[fGuard.Exception.ARGUMENT_NULL_ERR]		= 'null is not allowed value of %0 argument "%1" in "%2" function call.';

	// Function Guard.Arguments (pseudo type for JavaScript arguments object)
	(fGuard.Arguments	= function() {

	}).toString	= function() {
		return "function Arguments() {\n\t[guard code]\n}";
	};

	// Utility functions etc
	var aEndings	= 'st-nd-rd-th'.split('-'),
		rFunction	= /function ([^\s]+)\(/;
	function fFormat(sMessage, aArguments) {
		for (var nIndex = 0; nIndex < aArguments.length; nIndex++)
			sMessage	= sMessage.replace('%' + nIndex, aArguments[nIndex]);
		return sMessage;
	};

	// Expose object
	scope == window ? Guard	= fGuard : scope.Guard	= fGuard;
})(this);