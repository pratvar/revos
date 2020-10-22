import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import obj from './data.json'
import * as d3 from 'd3';

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
                                    if(vin === "VEHICLE_UI") 
                                        return vehicle1.map((cur,i) => <option key={i} value={cur.tripId}>{cur.tripId}</option>);
                                    if(vin === "AIMA_OFFICE") 
                                        return vehicle2.map((cur,i) => <option key={i} value={cur.tripId}>{cur.tripId}</option>);
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

function Data({vin, tripId, data}) {
    
    const linechart = useRef(null);

    useEffect(() => {
        const chart = d3.select(linechart.current);
        
        // clear previous
        chart.selectAll('circle').remove();
        chart.selectAll('g').remove();

        if(tripId !== "Select Trip" && data.batteryVoltageAdc !== []) {

            const padding = 30;
            const height = 200;
            const width = 400;
            chart.attr('height', height+padding).attr('width', width+padding)

            const fluctuation = data.batteryVoltageAdc

            // set scale and axes
            const xScale = d3.scaleLinear().domain([0, fluctuation.length]).range([padding, width+padding]);
            const yScale = d3.scaleLinear().domain([Math.floor(Math.min(...fluctuation))-3, Math.ceil(Math.max(...fluctuation))+3]).range([height, padding/2]);
            const xAxis = d3.axisBottom().scale(xScale).tickValues([]);
            const yAxis = d3.axisLeft().scale(yScale);
            console.log(fluctuation)
            // append circles
            chart.selectAll('circle')
            .data(fluctuation)
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('cx', (d,i) => xScale(i) + 5)
            .attr('cy', d => yScale(d) + padding/2)
            .attr('fill', 'cyan');

            // append axes
            chart.append('g')
                 .call(xAxis)
                 .attr('transform', `translate(-2, ${height+padding/2})`)
            chart.append('g')
                 .call(yAxis)
                 .attr('transform', `translate(${padding-2}, ${padding/2})`)
        }
    });

    const display = value => value ? value : "-";
    
    if(tripId === "Select Trip") return null; // TODO: design blank dashboard
    
    return (
        <div className="data">
            <div className="main">
                <div className="info">
                    <div className="pair">
                        <span className="key material-icons">place</span>
                        <span className="value">{display(data.distance)}</span>
                        <div className="tooltip">Distance</div>
                    </div>
                    <div className="pair">
                        <span className="key material-icons">power</span>
                        <span className="value">{display(data.energy)}</span>
                        <div className="tooltip">Energy Consumption</div>
                    </div>
                    <div className="pair">
                        <span className="key material-icons">speed</span>
                        <span className="value">{display(data.maxGpsSpeed)}</span>
                        <div className="tooltip">Max Speed (GPS)</div>
                    </div>
                </div>
                <div className="RPM">
                    <div className="RPMval">{display(data.minWheelRPM)}</div><span>Min RPM</span>
                    <div className="RPMval">{display(data.maxWheelRPM)}</div><span>Max RPM</span>
                </div>
            </div>
            <div className="voltage">
                Battery Voltage Fluctuation
                <div className="linechart">
                    <svg ref={linechart}></svg>
                </div>
            </div>
        </div>
    )
}

function App() {

    const [vin, setVin] = useState("Select Vehicle");
    const [tripId, setTripId] = useState("Select Trip");

    let arr;
    vin === "VEHICLE_UI" ? arr = vehicle1 : arr = vehicle2;
    let i = arr.map(cur => cur.tripId).indexOf(tripId);
    let data = arr[i];
    
    return (
        <div className="container">
            <Select vin={vin} setVin={setVin} tripId={tripId} setTripId={setTripId} />
            <Data vin={vin} tripId={tripId} data={data} />
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'));