import { useState } from 'react';
import Decimal from 'decimal.js';
import { z } from 'zod';
import './index.scss';

const CounterPropsSchema = z.object({
  initialValue: z.number().default(0),
  step: z.number().default(1),
});

type CounterProps = z.infer<typeof CounterPropsSchema>;

export const Counter = (props: CounterProps) => {
  const validatedProps = CounterPropsSchema.parse(props);
  const [count, setCount] = useState(new Decimal(validatedProps.initialValue));

  const increment = () => setCount(count.plus(validatedProps.step));
  const decrement = () => setCount(count.minus(validatedProps.step));

  return (
    <div className="counter">
      <h2>Counter Example</h2>
      <div className="counter__display">{count.toString()}</div>
      <div className="counter__buttons">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};
