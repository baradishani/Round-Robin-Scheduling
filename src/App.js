import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [processes, setProcesses] = useState([{ arrivalTime: "", burstTime: "" }]);
  const [quantum, setQuantum] = useState("");
  const [output, setOutput] = useState(null);

  const addProcess = () => {
    setProcesses([...processes, { arrivalTime: "", burstTime: "" }]);
  };

  const handleInputChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = value;
    setProcesses(newProcesses);
  };

  const calculateRoundRobin = () => {
    const timeQuantum = parseFloat(quantum) || 1;
    const arrivalTimes = processes.map((p) => parseFloat(p.arrivalTime) || 0);
    const burstTimes = processes.map((p) => parseFloat(p.burstTime) || 0);
    const processCount = processes.length;

    let processList = [];
    for (let i = 0; i < processCount; i++) {
      processList.push({
        id: `P${i + 1}`,
        arrivalTime: arrivalTimes[i],
        burstTime: burstTimes[i],
        remainingTime: burstTimes[i],
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
      });
    }

    let currentTime = 0;
    let queue = [];
    let ganttChart = [];
    let completedProcesses = 0;

    let inQueue = Array(processCount).fill(false);

    while (completedProcesses !== processCount) {
      for (let i = 0; i < processList.length; i++) {
        if (processList[i].arrivalTime <= currentTime && !inQueue[i] && processList[i].remainingTime > 0) {
          queue.push(processList[i]);
          inQueue[i] = true;
        }
      }

      if (queue.length > 0) {
        let currentProcess = queue.shift();

        let execTime = Math.min(timeQuantum, currentProcess.remainingTime);
        currentProcess.remainingTime -= execTime;
        currentTime += execTime;

        ganttChart.push({
          process: currentProcess.id,
          start: currentTime - execTime,
          end: currentTime,
        });

        if (currentProcess.remainingTime === 0) {
          currentProcess.completionTime = currentTime;
          completedProcesses++;
        } else {
          for (let i = 0; i < processList.length; i++) {
            if (processList[i].arrivalTime <= currentTime && !inQueue[i] && processList[i].remainingTime > 0) {
              queue.push(processList[i]);
              inQueue[i] = true;
            }
          }
          queue.push(currentProcess);
        }
      } else {
        currentTime++;
      }
    }

    processList.forEach((p) => {
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
    });

    const totalWaitingTime = processList.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaroundTime = processList.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const avgWaitingTime = (totalWaitingTime / processCount).toFixed(2);
    const avgTurnaroundTime = (totalTurnaroundTime / processCount).toFixed(2);

    setOutput({
      ganttChart: ganttChart.map((g) => ({ process: g.process, start: g.start, end: g.end })),
      processes: processList,
      avgWaitingTime,
      avgTurnaroundTime,
    });
  };

  return (
    <div className="app-container">
      <h1>Round Robin Scheduling Algorithm</h1>

      <div className="input-section">
        <input
          id="quantum"
          value={quantum}
          onChange={(e) => setQuantum(e.target.value)}
          placeholder="Enter time quantum"
        />
      </div>

      <h2>Processes</h2>
      <table>
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>P{index + 1}</td>
              <td>
                <input
                  value={process.arrivalTime}
                  onChange={(e) => handleInputChange(index, "arrivalTime", e.target.value)}
                  placeholder="Arrival Time"
                />
              </td>
              <td>
                <input
                  value={process.burstTime}
                  onChange={(e) => handleInputChange(index, "burstTime", e.target.value)}
                  placeholder="Burst Time"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-process" onClick={addProcess}>
        +
      </button>
      <br />
      <button className="calculate" onClick={calculateRoundRobin}>
        Calculate
      </button>

      {output && (
        <div className="output-section">
          <h2>Results:</h2>
          <h3>Gantt Chart:</h3>
          <div className="gantt-chart">
            {output.ganttChart.map((g, i) => (
              <div className="gantt-box" key={i}>
                <span>{g.process}</span>
                <span>{`(${g.start} - ${g.end})`}</span>
              </div>
            ))}
          </div>

          <h3>Process Details:</h3>
          <table>
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Waiting Time</th>
                <th>Turnaround Time</th>
              </tr>
            </thead>
            <tbody>
              {output.processes.map((p, i) => (
                <tr key={i}>
                  <td>P{i + 1}</td>
                  <td>{p.arrivalTime}</td>
                  <td>{p.burstTime}</td>
                  <td>{p.waitingTime}</td>
                  <td>{p.turnaroundTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Averages:</h3>
          <p>Average Waiting Time: {output.avgWaitingTime}</p>
          <p>Average Turnaround Time: {output.avgTurnaroundTime}</p>
        </div>
      )}
    </div>
  );
};

export default App;
