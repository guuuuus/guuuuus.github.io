let midiIn = [];
let midiOut = [];
let outputdevice;
let dataarr = [150];
let dev;
let count = 10;
let connected = false;
let devtype = "thijscomander"
const msg = [0xF0, 0x7E, 0x55, 0x55, 0x55, 0x55, 0x55, 0xF7];
onload();

function onload() {
    if (!navigator.requestMIDIAccess) {
        alert("MIDI is not enabled in this browser, please use firefox, Chrome, Chromium, Opera or Edge on desktop.");
        return false;
    }
}
function rotaryact() {
    return 0;
}

function buttonact() {
    return 0;
}


function connectMIDI() {
    navigator.requestMIDIAccess({ sysex: true })
        .then(
            (midi) => midiReady(midi),
            (err) => console.log('Something went wrong', err));
}

function setVisible(devicetype) {
    let visstate = "visible";
    if (devicetype = "harmen")
        visstate = "hidden";
    document.getElementById("button5tr").style.visibility = visstate;
    document.getElementById("button6tr").style.visibility = visstate;

}

async function midiReady(midi) {
    // Also react to device changes.
    midi.addEventListener('statechange', (event) => disconect(event.target));
    midiIn = [];
    midiOut = [];
    console.log(midi);
    console.log(midi.sysexEnabled);

    // // MIDI devices that send you data.
    // const inputs = midi.inputs.values();
    // for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    // midiIn.push(input.value);
    // }

    // MIDI devices that you send data to.
    const outputs = midi.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOut.push(output.value);
    }
    for (let index = 0; index < midiOut.length; index++) {
        console.log(midiOut[index]);
        console.log(midiOut[index].sysexEnabled);
        var devname = midiOut[index].name;
        if ((midiOut[index].manufacturer == "GUUUUS") || (devname.indexOf("Harmens") >= 0) || d(evname.indexOf("Thijs") >= 0)) {
            outputdevice = index;
            if (devname.indexOf("Harmens") >= 0)
                devtype = "harmen";
            usermesg("found device");
            setVisible(devtype);
            break;

        }

    }
    if (!outputdevice) {
        console.log("no device found");
        usermesg("no device found");
    } else {
        midiOut[outputdevice].open();
        sleep(200).then(() => {
            if (connected == false) {
                midiOut[outputdevice].send(msg);
                connected = true;
            }

        });
    }
    console.log(outputdevice);
}

async function sendMIDI() {
    getdata();
    let splitdata = [0xF0, 0x7E];

    device = 0;
    for (let index = 0; index < dataarr.length; index++) {
        splitdata.push((dataarr[index] >> 4) | 0x60);
        splitdata.push((dataarr[index] & 0x0f) | 0x50);
    }

    splitdata.push(0xf7);
    // console.log(splitdata);
    if (connected) {
        midiOut[outputdevice].send(msg);
        sleep(200).then(() => midiOut[outputdevice].send(splitdata));
        usermesg("send data, check device")
    }
    else {
        usermesg("no data send")

    }
}
function usermesg(msg) {
    let current = document.getElementById("message").innerHTML;
    msg += "<br>";
    msg += current;
    document.getElementById("message").innerHTML = msg;
}

function getdata() {
    dataarr = [];

    let oscoffset = 33;
    //network
    dataarr[0] = parseInt(document.getElementById("localip1").value);
    dataarr[1] = parseInt(document.getElementById("localip2").value);
    dataarr[2] = parseInt(document.getElementById("localip3").value);
    dataarr[3] = parseInt(document.getElementById("localip4").value);

    dataarr[4] = parseInt(document.getElementById("netmask1").value);
    dataarr[5] = parseInt(document.getElementById("netmask2").value);
    dataarr[6] = parseInt(document.getElementById("netmask3").value);
    dataarr[7] = parseInt(document.getElementById("netmask4").value);

    let dhcp = document.getElementById("dhcp");
    dataarr[8] = ((dhcp.checked == true) ? 1 : 0);
    // osc net
    dataarr[9] = parseInt(document.getElementById("targetip1").value);
    dataarr[10] = parseInt(document.getElementById("targetip2").value);
    dataarr[11] = parseInt(document.getElementById("targetip3").value);
    dataarr[12] = parseInt(document.getElementById("targetip4").value);

    let targetport = parseInt(document.getElementById("targetport").value);
    dataarr[13] = (0xff & targetport);
    dataarr[14] = (0xff & (targetport >> 8));

    let receiveport = parseInt(document.getElementById("receiveport").value);
    dataarr[15] = (0xff & receiveport);
    dataarr[16] = (0xff & (receiveport >> 8));

    //midi
    dataarr[17] = parseInt(document.querySelector('input[name="midicommand"]:checked').value);
    dataarr[18] = parseInt(document.getElementById("midichannel").value) - 1;
    dataarr[19] = parseInt(document.getElementById("midioffset").value);


    // button rotary actions

    dataarr[20] = parseInt(document.querySelector('input[name="buttonaction"]:checked').value);
    dataarr[21] = parseInt(document.querySelector('input[name="rotaryaction"]:checked').value);

    let rotarymin = parseInt(document.getElementById("rotarymin").value);
    let rotarymax = parseInt(document.getElementById("rotarymax").value);

    dataarr[22] = (0xff & rotarymin);
    dataarr[23] = (0xff & (rotarymin >> 8));

    dataarr[24] = (0xff & rotarymax);
    dataarr[25] = (0xff & (rotarymax >> 8));

    dataarr[26] = parseInt(document.getElementById("rotarystep").value);

    // display and led brightness
    dataarr[27] = parseInt(document.getElementById("ledbrightness").value);
    dataarr[28] = parseInt(document.getElementById("displaybrightness").value);

    // pointer to oscpaths/ set to 0
    dataarr[29] = 0;
    dataarr[30] = 0;
    dataarr[31] = 0;
    dataarr[32] = 0;


    // rotarypath
    let [ascii, len] = toascii20(document.getElementById("rotarypath").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="rotarytype"]:checked').value);
    oscoffset += 22;
    //but1
    [ascii, len] = toascii20(document.getElementById("button1path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button1type"]:checked').value);
    oscoffset += 22;

    [ascii, len] = toascii20(document.getElementById("button2path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button2type"]:checked').value);
    oscoffset += 22;

    [ascii, len] = toascii20(document.getElementById("button3path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button3type"]:checked').value);
    oscoffset += 22;

    [ascii, len] = toascii20(document.getElementById("button4path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button4type"]:checked').value);
    oscoffset += 22;

    [ascii, len] = toascii20(document.getElementById("button5path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button5type"]:checked').value);
    oscoffset += 22;

    [ascii, len] = toascii20(document.getElementById("button6path").value);
    arrayoffset(dataarr, ascii, oscoffset);
    dataarr[oscoffset + 20] = len;
    dataarr[oscoffset + 21] = parseInt(document.querySelector('input[name="button6type"]:checked').value);
    oscoffset += 22;

    document.getElementById("debug").innerHTML = '';

    for (let index = 0; index < dataarr.length; index += 8) {
        document.getElementById("debug").innerHTML += dataarr.slice(index, index + 8);
        document.getElementById("debug").innerHTML += '<br>'
    }
    document.getElementById("debug").innerHTML += '<br>'
    document.getElementById("debug").innerHTML += dataarr.length

}
function toascii20(string) {
    let ascii = [];
    let len;
    for (len = 0; len < string.length; len++)
        ascii.push(string[len].charCodeAt(0))
    // // padd 00
    for (i = len; i < 20; i++)
        ascii.push(0);
    return [ascii, len];
}

function arrayoffset(dest, source, offset) {
    for (let i = 0; i < source.length; i++) {
        dest[i + offset] = source[i];

    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ondisconnect(x) {
    console.log(x);
    connected = false;
}