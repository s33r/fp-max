import { Counter } from '../Counter';
import './index.scss';

export const App = () => {
  return (
    <div className="app">
      <h1>React Component Collection</h1>
      <Counter initialValue={0} step={1} />
    </div>
  );
};
