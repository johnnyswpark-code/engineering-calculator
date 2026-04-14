/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { create, all } from 'mathjs';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Settings, 
  Delete, 
  History as HistoryIcon, 
  Calculator, 
  FlaskConical, 
  ChevronDown,
  X,
  Minus,
  Plus,
  Equal,
  Percent
} from 'lucide-react';
import { cn } from './lib/utils';

const math = create(all);

type Mode = 'basic' | 'scientific' | 'history';

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<Mode>('basic');
  const [isScientific, setIsScientific] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [display, expression]);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      const result = math.evaluate(fullExpression.replace('×', '*').replace('÷', '/'));
      const formattedResult = Number(result.toFixed(8)).toString();
      
      setHistory([{
        expression: fullExpression,
        result: formattedResult,
        timestamp: Date.now()
      }, ...history]);
      
      setDisplay(formattedResult);
      setExpression('');
    } catch (error) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleScientific = (func: string) => {
    try {
      let result;
      const val = parseFloat(display);
      switch(func) {
        case 'sin': result = math.sin(val); break;
        case 'cos': result = math.cos(val); break;
        case 'tan': result = math.tan(val); break;
        case 'log': result = math.log10(val); break;
        case 'ln': result = math.log(val); break;
        case 'sqrt': result = math.sqrt(val); break;
        case 'pow': setExpression(display + ' ^ '); setDisplay('0'); return;
        case 'pi': setDisplay(math.pi.toString()); return;
        case 'e': setDisplay(math.e.toString()); return;
        default: return;
      }
      setDisplay(Number(result.toFixed(8)).toString());
    } catch (e) {
      setDisplay('Error');
    }
  };

  const formatNumber = (num: string) => {
    if (num === 'Error') return num;
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-surface overflow-hidden relative">
      {/* Header */}
      <header className="glass-panel fixed top-0 w-full max-w-md z-50 shadow-xl shadow-blue-900/5">
        <div className="flex justify-between items-center px-6 py-4">
          <button className="hover:bg-surface-container transition-colors p-2 rounded-full">
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-bold text-primary font-headline tracking-tight">Precisionist</h1>
          <button className="hover:bg-surface-container transition-colors p-2 rounded-full">
            <Settings className="w-6 h-6 text-primary" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 pb-28 px-6 gap-6 overflow-hidden">
        {mode === 'history' ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <h2 className="text-2xl font-bold font-headline mb-4">History</h2>
            {history.length === 0 ? (
              <p className="text-on-surface-variant text-center mt-10">No history yet</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="flex flex-col items-end gap-1 p-4 rounded-2xl bg-surface-container-low">
                  <span className="text-sm text-on-surface-variant">{item.expression} =</span>
                  <span className="text-xl font-bold text-primary">{formatNumber(item.result)}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Display Area */}
            <section className="flex flex-col items-end justify-end flex-1 pb-4 min-h-[200px]">
              <div className="flex flex-col items-end gap-2 opacity-60 mb-4 h-12">
                <div className="font-body text-sm text-on-surface-variant">
                  {expression}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-headline text-xs font-bold tracking-widest flex items-center gap-2">
                  <ChevronDown className="w-3 h-3" />
                  {expression.includes('^') ? 'POWER' : expression.includes('*') ? 'MULTIPLY' : expression.includes('/') ? 'DIVIDE' : expression.includes('+') ? 'ADD' : expression.includes('-') ? 'SUBTRACT' : 'READY'}
                </span>
              </div>

              <div className="w-full text-right overflow-hidden">
                <motion.div 
                  key={display}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-headline text-6xl font-bold tracking-tighter text-on-surface break-all"
                >
                  {formatNumber(display).split('.').map((part, i) => (
                    <span key={i} className={i === 1 ? "text-primary/40" : ""}>
                      {i === 1 ? '.' + part : part}
                    </span>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Keypad */}
            <section className="grid grid-cols-4 gap-3 pb-4">
              {mode === 'scientific' && (
                <div className="col-span-4 grid grid-cols-4 gap-3 mb-3">
                  {['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pi', 'e'].map((func) => (
                    <button 
                      key={func}
                      onClick={() => handleScientific(func)}
                      className="aspect-square flex items-center justify-center rounded-2xl bg-surface-container-high text-primary font-headline text-sm font-bold hover:bg-surface-container-highest active:scale-90 transition-all"
                    >
                      {func}
                    </button>
                  ))}
                </div>
              )}
              
              <button onClick={clear} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface font-headline text-xl hover:bg-surface-container-high active:scale-90 transition-all">AC</button>
              <button onClick={backspace} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface font-headline text-xl hover:bg-surface-container-high active:scale-90 transition-all">
                <Delete className="w-6 h-6" />
              </button>
              <button onClick={() => handleOperator('%')} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface font-headline text-xl hover:bg-surface-container-high active:scale-90 transition-all">
                <Percent className="w-6 h-6" />
              </button>
              <button onClick={() => handleOperator('/')} className="aspect-square flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-headline text-2xl hover:brightness-95 active:scale-90 transition-all">
                <span className="text-2xl">÷</span>
              </button>

              {[7, 8, 9].map(n => (
                <button key={n} onClick={() => handleNumber(n.toString())} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-low text-on-surface font-headline text-2xl font-semibold hover:bg-surface-container active:scale-90 transition-all">{n}</button>
              ))}
              <button onClick={() => handleOperator('*')} className="aspect-square flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-headline text-2xl hover:brightness-95 active:scale-90 transition-all">
                <X className="w-6 h-6" />
              </button>

              {[4, 5, 6].map(n => (
                <button key={n} onClick={() => handleNumber(n.toString())} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-low text-on-surface font-headline text-2xl font-semibold hover:bg-surface-container active:scale-90 transition-all">{n}</button>
              ))}
              <button onClick={() => handleOperator('-')} className="aspect-square flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-headline text-2xl hover:brightness-95 active:scale-90 transition-all">
                <Minus className="w-6 h-6" />
              </button>

              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => handleNumber(n.toString())} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-low text-on-surface font-headline text-2xl font-semibold hover:bg-surface-container active:scale-90 transition-all">{n}</button>
              ))}
              <button onClick={() => handleOperator('+')} className="aspect-square flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-headline text-2xl hover:brightness-95 active:scale-90 transition-all">
                <Plus className="w-6 h-6" />
              </button>

              <button onClick={() => handleNumber('0')} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-low text-on-surface font-headline text-2xl font-semibold hover:bg-surface-container active:scale-90 transition-all">0</button>
              <button onClick={() => handleNumber('.')} className="aspect-square flex items-center justify-center rounded-full bg-surface-container-low text-on-surface font-headline text-2xl font-semibold hover:bg-surface-container active:scale-90 transition-all">.</button>
              <button onClick={calculate} className="col-span-2 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline text-3xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <Equal className="w-8 h-8" />
              </button>
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full max-w-md z-50 flex justify-around items-center px-4 pb-8 pt-4 glass-panel rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <button 
          onClick={() => setMode('basic')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all duration-300 active:scale-90",
            mode === 'basic' ? "bg-primary/10 text-primary shadow-sm" : "text-on-surface-variant"
          )}
        >
          <Calculator className={cn("w-6 h-6", mode === 'basic' && "fill-current")} />
          <span className="text-[11px] font-medium mt-1">Basic</span>
        </button>

        <button 
          onClick={() => setMode('scientific')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all duration-300 active:scale-90",
            mode === 'scientific' ? "bg-primary/10 text-primary shadow-sm" : "text-on-surface-variant"
          )}
        >
          <FlaskConical className={cn("w-6 h-6", mode === 'scientific' && "fill-current")} />
          <span className="text-[11px] font-medium mt-1">Scientific</span>
        </button>

        <button 
          onClick={() => setMode('history')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all duration-300 active:scale-90",
            mode === 'history' ? "bg-primary/10 text-primary shadow-sm" : "text-on-surface-variant"
          )}
        >
          <HistoryIcon className={cn("w-6 h-6", mode === 'history' && "fill-current")} />
          <span className="text-[11px] font-medium mt-1">History</span>
        </button>
      </nav>

      {/* Background Decoration */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
    </div>
  );
}
