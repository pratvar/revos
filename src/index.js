import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import obj from './data.json'
import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoicHJhdHZhciIsImEiOiJja2drcHB3MjUwNHJqMzBvNmxocDR0MWh3In0.WoJAvM_mx1r5UJ1ZLF_7sg';


const data = obj.trip

const vehicle1 = data.slice(0,10)
const vehicle2 = data.slice(10, 20)

console.log(vehicle1[3].location.length)

// select vehicle and trip before loading data
function Select({vin, setVin, tripId, setTripId}) {
    return (
        <div className="select">
            <div>
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
    const mode = useRef(null);
    const map = useRef(null);

    function createVoltageChart(chart, fluctuation) {
        const padding = 30;
            const height = 200;
            const width = 400;
            chart.attr('height', height+padding).attr('width', width+padding)


            // set scale and axes
            const xScale = d3.scaleLinear().domain([0, fluctuation.length]).range([padding, width+padding]);
            const yScale = d3.scaleLinear()
                            .domain([Math.floor(Math.min(...fluctuation))-3, Math.ceil(Math.max(...fluctuation))+3])
                            .range([height, padding/2]);
            const xAxis = d3.axisBottom().scale(xScale).tickValues([]);
            const yAxis = d3.axisLeft().scale(yScale);

            // array containing circle positions as objects
            const circlePositions = fluctuation.map((cur,i) => {
                return {
                    x: xScale(i) + 5,
                    y: yScale(cur) + padding/2
                }
            });

            // append line connecting the circles
            chart.append('path')
                 .datum(circlePositions)
                 .attr('fill', 'none')
                 .attr("stroke", "steelblue")
                 .attr("stroke-width", 1.5)
                 .attr('d', d3.line().x(d => (d.x)).y(height/2 + padding))
                 .transition().duration(300)
                 .attr("d", d3.line().x(d => (d.x)).y(d => (d.y)));
            
            // append circles
            chart.selectAll('circle')
            .data(fluctuation)
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('fill', 'cyan')
            .attr('cx', (d,i) => circlePositions[i].x)
            .attr('cy', height/2 + padding)
            .transition().duration(300)
            .attr('cy', (d,i) => circlePositions[i].y);

            // append axes
            chart.append('g')
                 .call(xAxis)
                 .attr('transform', `translate(-10, ${height+padding/2})`);
            chart.append('g')
                 .call(yAxis)
                 .attr('transform', `translate(${padding-10}, ${padding/2})`);
    }
    function createModeChart(modeChart, modes, modeArray) {
        modeChart.attr('height', 20).attr('width', 400)
        // set scale
        const scale = d3.scaleLinear().domain([0, [...modeArray].reduce((a, b) => a + b, 0)]).range([0, 400]);
        const scaledArray = modeArray.map(cur => scale(cur))
        // set color
        function color(i) {
            switch(Object.keys(modes)[i]) {
                case 'ECONOMY': return '#4caf50'
                case 'RIDE': return '#2196f3'
                case 'SPORT': return '#f44336'
                default: return null
            }
        }
        // set position
        function setPosition(i) {
            switch(i) {
                case 0: return 0
                case 1: return scaledArray[0]
                case 2: return scaledArray[0] + scaledArray[1]
                default: return null
            }
        }
        // append rects
        modeChart.selectAll('rect')
                .data(scaledArray)
                .enter()
                .append('rect')
                .attr('height', 20)
                .attr('fill', (d,i) => color(i))
                .attr('width', 400/3)
                .attr('x', (d,i) => i* 400/3)
                .transition().duration(300)
                .attr('width', d => d)
                .attr('x', (d,i) => setPosition(i))
    }
    function createMap(location) {
        let locArray = [];
        for(let i = 0; i < location.length; i++) {
            locArray.push([location[i].lng, location[i].lat])
        }
        console.log(locArray);
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: locArray[Math.floor(locArray.length/2)],
            zoom: 15
        });
        map.on('load', function () {
            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': locArray
                    }
                }
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#3f51b5',
                    'line-width': 8
                }
            });
            var bounds = locArray.reduce(function (bounds, coord) {
                return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(locArray[0], locArray[0]));
                 
                map.fitBounds(bounds, {
                padding: 80,
                duration: 300
                });
        });
    }

    useEffect(() => {
        const chart = d3.select(linechart.current);
        const modeChart = d3.select(mode.current);
        map.current.innerHTML = "";
        // clear previous
        chart.selectAll('circle').remove();
        chart.selectAll('g').remove();
        chart.selectAll('path').remove();
        modeChart.selectAll('rect').remove();

        if(tripId !== "Select Trip") {
            if(data.batteryVoltageAdc) {
                const fluctuation = data.batteryVoltageAdc
                createVoltageChart(chart, fluctuation);
            }
            if(data.mode) {
                const modeArray = Object.values(data.mode);
                createModeChart(modeChart, data.mode, modeArray);
            }
            if(data.location !== [] && data.location.length !== 0) {
                createMap(data.location);
            }
        }
    });

    const display = value => value ? value : "-";
    const displayTime = (str) => {
        if(str == null) return "-";
        str = str.replace('T', ', ');
        return str.substr(0,20);
    }
    
    return (
        <div className="data">
            <div className="main">
                <div className="info">
                    <div className="pair">
                        <span className="key material-icons">place</span>
                        <span className="value">{tripId!=="Select Trip" ? display(data.distance) : "-"}</span>
                        <div className="tooltip">Distance</div>
                    </div>
                    <div className="pair">
                        <span className="key material-icons">power</span>
                        <span className="value">{tripId!=="Select Trip" ? display(data.energy) : "-"}</span>
                        <div className="tooltip">Energy Consumption</div>
                    </div>
                    <div className="pair">
                        <span className="key material-icons">speed</span>
                        <span className="value">{tripId!=="Select Trip" ? display(data.maxGpsSpeed) : "-"}</span>
                        <div className="tooltip">Max Speed (GPS)</div>
                    </div>
                </div>
                <div className="RPM">
                    <div className="RPMval">{tripId!=="Select Trip" ? display(data.minWheelRPM) : "-"}</div><span>Min RPM</span>
                    <div className="RPMval">{tripId!=="Select Trip" ? display(data.maxWheelRPM) : "-"}</div><span>Max RPM</span>
                </div>
            </div>
            <div className="voltage">
                Battery Voltage Change Over Time
                <div className="linechart">
                    <svg ref={linechart}></svg>
                </div>
            </div>
            <div className="mode">
                <div className="title">
                    Mode
                </div>
                <svg ref={mode} height="10"></svg>
                <div className="modeSpec">
                    <span className="modeKey"><i className="economy material-icons">monetization_on</i>Economy</span>
                    <span className="modeVal">{tripId!=="Select Trip" && vin === "VEHICLE_UI" ? data.mode["ECONOMY"] : "0"}</span>
                </div>
                <div className="modeSpec">
                    <span className="modeKey"><i className="ride material-icons">play_circle_filled</i>Ride</span>
                    <span className="modeVal">{tripId!=="Select Trip" && vin === "VEHICLE_UI" ? data.mode["RIDE"] : "0"}</span>
                </div>
                <div className="modeSpec">
                    <span className="modeKey"><i className="sport material-icons">offline_bolt</i>Sport</span>
                    <span className="modeVal">{tripId!=="Select Trip" && vin === "VEHICLE_UI" ? data.mode["SPORT"] : "0"}</span>
                </div>
            </div>
            <div className="other">
                <div className="duration">
                    <div className="pair">
                        <div className="key">From</div>
                        <div className="value">{tripId!=="Select Trip" ? displayTime(data.startTime) : "-"}</div>
                    </div>
                    <div className="pair">
                        <div className="key">To</div>
                        <div className="value">{tripId!=="Select Trip" ? displayTime(data.endTime) : "-"}</div>
                    </div>
                </div>
                <div className="mapContainer">
                    <div id="map" ref={map}>
                        
                    </div>
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

