// https://github.com/marcellus00/ESP32_BLE_Button/blob/master/BlePortal/index.html 
//  
const decoder = new TextDecoder('utf-8');

const dataService = '5e87bd74-b350-4a6a-ae36-bb33e30499af';

const dataCharacteristic = '2e550f9f-c882-467a-b35a-c7f12ecae2b3';

var bleDevice = null;

function onDevice()
{
	clearLog();
	setDisabled("connect", true);	
	setDisplay("dataInput", "none");
	setContent("deviceName", "Connecting...");
	return navigator.bluetooth.requestDevice(
		{
			acceptAllDevices: true,
			optionalServices: [dataService]
		})
		.then(device => {
			bleDevice = device;
			setDisabled("connect", false);
			setDisabled("startButton", false);
			setDisplay("dataInput", "inline");
			setContent("deviceName", "Device ID: " + bleDevice.id);
			setValue("deviceName", bleDevice.name);
			bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
		})
		.then(any => readChar(dataCharacteristic, setData))
		.catch(error => 
			{
				clearLog();
				log('Bluetooth Device Connecting Error. Please connect it again.');
				console.log("BLE Connecting Error:",error.message)
			});
}

function onDisconnected()
{
	clearLog();
	log('Bluetooth Device disconnected');
}

function onDisconnectButtonClick() {
  if (!bleDevice) {
    return;
  }
  log('Disconnecting from Bluetooth Device...');
  if (bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
  } else {
    log('> Bluetooth Device is already disconnected');
  }
}

function setDisplay(id, display)
{
	document.getElementById(id).style.display = display;
}

function setDisabled(id, disabled)
{
	document.getElementById(id).disabled = disabled;
}

function setContent(id, text)
{
	document.getElementById(id).innerHTML = text;
}

function setValue(id, text)
{
	document.getElementById(id).value = text;
}



function getChar(characteristic)
{	
	return bleDevice.gatt.connect()
	.then(server => server.getPrimaryService(dataService))
	.then(service => service.getCharacteristic(characteristic))
}

function readChar(char, handle)
{
	return getChar(char)
	.then(ch => ch.readValue()) // writeValue() or readValue() belong to charateristic servce.
	.then(value => decoder.decode(value))
	.then(result => handle(result));
}

/*
function handleData(event)
{
	setData(decoder.decode(event.target.value));
}
*/

function setData(value)
{
	return document.getElementById('data').innerHTML = value;
}

function getThisValue(theObject) {  //When using "this" as parameter, can get clicked button (object).
	let data = theObject.value;
	return data;
}

function sendCode(data)
{
	console.log("Data before encoding:",data);
	let encoder = new TextEncoder('utf-8');
	let data2 = encoder.encode(data);
	console.log("Data after encoding:",data2);
	getChar(dataCharacteristic)   //parameter is bluetooth's Chracteristic UUID, connect via bluetooth, and get chracteristic servic.
	.then(ch => ch.writeValue(data2))  // writeValue() or readValue() belong to charateristic servce.
	.catch(error => console.log(error));
}

function log() {
	var line = Array.prototype.slice.call(arguments).map(function (argument) {
			return typeof argument === 'string' ? argument : JSON.stringify(argument);
		}).join(' ');
	
	document.querySelector('#log').textContent += line + '\n';
}

function clearLog() {
	document.querySelector('#log').textContent = '';
	setData('');
	setContent("deviceName", "");
	setDisplay("dataInput", "none");
	setDisabled("connect", false);
}
