import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import obj from './data.json'

const data = obj.trip

const vehicle1 = data.slice(0,10)
const vehicle2 = data.slice(10, 20)

console.log(vehicle1, vehicle2)

// select vehicle and trip before loading data
function Select({vin, setVin, tripId, setTripId}) {
    return (
        <div className="select">
            <div className="flex-end">
                <label htmlFor="vin">vin:</label>
                <select name="vin" id="vin" value={vin} onChange={e => {setVin(e.target.value); setTripId("Select Trip")}}>
                    <option value="Select Vehicle" disabled>Select Vehicle</option>
                    <option value="VEHICLE_UI">VEHICLE_UI</option>
                    <option value="AIMA_OFFICE">AIMA_OFFICE</option>
                </select>
            </div>
            <div>
            <label htmlFor="tripId">tripId:</label>
            {(() => {
                    if(vin!=="Select Vehicle") {
                        return (
                            <select name="tripId" id="tripId" value={tripId} onChange={e => setTripId(e.target.value)}>
                                <option value="Select Trip" selected disabled>Select Trip</option>
                                {(() => { 
                                    if(vin === "VEHICLE_UI") return vehicle1.map((cur,i) => <option key={i} value={cur.tripId}>{cur.tripId}</option>);
                                    if(vin === "AIMA_OFFICE") return vehicle2.map((cur,i) => <option key={i} value={cur.tripId}>{cur.tripId}</option>);
                                    })()
                                }
                            </select>
                            )
                    } else return (<select name="tripId" id="tripId" disabled><option value="Select Trip">Select Trip</option></select>)
                })()
            }
            </div>
        </div>
    )
}

function Data({vin, tripId}) {

    if(tripId === "Select Trip") return null; // TODO: design blank dashboard
    
    let arr;
    vin === "VEHICLE_UI" ? arr = vehicle1 : arr = vehicle2;
    let i = arr.map(cur => cur.tripId).indexOf(tripId);
    let data = arr[i];
    return (
        <div className="data">
            <div className="main">
                <div className="pair">
                    <span className="key material-icons">place</span>
                    <span className="value">{data.distance ? data.distance : "N/A"}</span>
                    <div className="tooltip">Distance</div>
                </div>
                <div className="pair">
                    <span className="key material-icons">power</span>
                    <span className="value">{data.energy ? data.energy : "N/A"}</span>
                    <div className="tooltip">Energy Consumption</div>
                </div>
                <div className="pair">
                    <span className="key material-icons">speed</span>
                    <span className="value">{data.maxGpsSpeed ? data.maxGpsSpeed : "N/A"}</span>
                    <div className="tooltip">Max Speed (GPS)</div>
                </div>
            </div>
            <div className="RPM">
                Min RPM: {data.minWheelRPM}<br/>
                Max RPM: {data.maxWheelRPM}
            </div>
            <div className="voltage">
                Battery Voltage Fluctuation:
                <div className="linechart">

                </div>
            </div>
        </div>
    )
}

function App() {

    const [vin, setVin] = useState("Select Vehicle");
    const [tripId, setTripId] = useState("Select Trip");
    
    return (
        <div className="container">
            <Select vin={vin} setVin={setVin} tripId={tripId} setTripId={setTripId} />
            <Data vin={vin} tripId={tripId} />
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'));