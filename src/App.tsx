import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import './App.scss';

const dummyData: IDataRow[] = [
	{ name: 'A', weight: 3, value: -0.02 },
	{ name: 'B', weight: 3, value: 0.05 },
	{ name: 'C', weight: 6, value: 0.015 },
	{ name: 'D', weight: 2, value: -0.01 },
	{ name: 'E', weight: 3, value: 0.01 }
]
interface IDataRow {
	[propName: string]: string | number;
	name: string;
	weight: number;
	value: number;
}
const initRowData: IDataRow = {
	name: '',
	weight: 0,
	value: 0,
}

function App() {
	const [data, setData] = useState<IDataRow[]>([...dummyData, {...initRowData}]);
	const [row, setRow] = useState(3);
	const addRow = (): void => {
		setData([...data, {...initRowData}])
	}
	const removeRow = (idx: number): void => {
		const newData = [...data];
		newData.splice(idx, 1);
		setData([...newData]);
	}
	return (
		<div className="App">
			<div className="inputs">
				<div className="wrapper">
					<label htmlFor="data">Data</label>
					<DataInputRow data={data} setData={setData} addRow={addRow} removeRow={removeRow} />
				</div>
				<div className="wrapper">
					<label htmlFor="row">Row</label>
					<div className="dataRow">
						<button onClick={() => setRow(row + 1)}>+</button>
						<input className="rowInput" type="number" value={row} readOnly/>
						<button onClick={() => setRow(row - 1)} disabled={row === 1}>-</button>
						{/* <input value={row} onChange={(e) => setRow(+e.target.value)} type="number" min="0" max={data.length} step="1"/> */}
					</div>
				</div>
			</div>
			<Treemap data={data} row={row}/>
		</div>
	);
}

/**********************************
 * DataInputRow component
 * ********************************/

interface IDataInputRowProps {
	data: IDataRow[];
	setData: (value: React.SetStateAction<IDataRow[]>) => void;
	addRow: () => void;
	removeRow: (idx: number) => void;
}

function DataInputRow({data, setData, addRow, removeRow}: IDataInputRowProps) {
	const onInputChange = (e: ChangeEvent<HTMLInputElement>, idx: number): void => {
		const {type, name, value} = e.target;
		const newData = [...data];
		newData[idx][name as keyof IDataRow] = type === 'number' ? +value : value;
		setData(newData);
	}
	return (
		<>
			{data.map(({name, weight, value}, idx) => (
				<div key={"name-" + idx} className="dataRow">
					<input value={name} type="text" name="name" onChange={(e) => onInputChange(e, idx)} placeholder="Name" maxLength={50} />
					<input value={weight || ''} type="number" name="weight" onChange={(e) => onInputChange(e, idx)} placeholder="Weight" min="0" step="1" />
					<input value={value || ''} type="number" name="value" onChange={(e) => onInputChange(e, idx)} placeholder="Value" step="0.005" />
					{data.length > 1 && <button onClick={() => removeRow(idx)}>x</button>}
				</div>
			))}
			<div className="dataRow">
				{data.length < 50 && <button onClick={() => addRow()}>+ Add data</button>}
			</div>
		</>
	)
}

/**********************************
 * Treemap component
 * ********************************/

interface ITreemapProps {
	data: IDataRow[];
	row: number;
}

function Treemap({data, row}: ITreemapProps) {
	data = data.filter(item => item.name && item.weight && item.value);
	const maxWeight = Math.max(...data.map(({weight}) => weight))

	const getRowWeight = useCallback((nextWeightTry: number = maxWeight): number => {
		const rowWeightArr = Array(row).fill(nextWeightTry);
		const dataWeightArr = data.map(item => item.weight);
		for(let k = 0; k < dataWeightArr.length; k++) {
			for(let i = 0; i < rowWeightArr.length; i++) {
				if (rowWeightArr[i] >= dataWeightArr[k]) {
					rowWeightArr[i] -= dataWeightArr[k];
					break;
				} else if (i === rowWeightArr.length - 1) {
					return getRowWeight(nextWeightTry + 1);
				}
			}
		}
		return nextWeightTry;
	}, [data, maxWeight, row])
	const rowHeight = getRowWeight();

	const temp = Array.from(Array(row)).map(() => []) as IDataRow[][];
	data.sort((a, b) =>  b.weight - a.weight)
	data.forEach((item, idx) => {
		for(let i = 0; i < temp.length; i++) {
			const stacked = temp[i].length ? temp[i].reduce((acc: number, curr: IDataRow) => acc + curr.weight, 0) : 0;
			if (!temp[i].length || (item.weight + stacked) <= rowHeight) {
				temp[i].push(item);
				break;
			}
		}
	})
	data = temp.reduce((acc, curr) => acc.concat(...curr), [])

	const rectStyle = (weight: number) => ({
		height: `calc(100% / ${row})`,
		width: `calc(100% / ${rowHeight} * ${weight})`,
	})
	const getDisplayValue = (value: number):string => {
		return (value * 100).toFixed(2) + '%';
	}

	useEffect(() => {

	}, [data])
	
	return (
		<div className="treemap wrapper">
			<label>Treemap</label>
			<div className="container">
				{data.map(({name, value, weight}, idx) => (
					<div key={"name-" + idx} style={rectStyle(weight)} className={'rect' + (value >= 0 ? ' green' : ' red')}> 
						<div className="name">{name}</div>
						<div className="value">{getDisplayValue(value)}</div>
					</div>
				))}
			</div>
		</div>
	)
}
	
export default App;
	