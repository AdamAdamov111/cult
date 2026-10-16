import { Component, type ReactNode } from 'react';

/** Ошибка в одном экране не должна оставлять пользователя с белым листом. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { console.error('[CULT]', err); }

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="pad" style={{ paddingTop: 80, textAlign: 'center' }}>
        <div className="wordmark" style={{ fontSize: 15, color: 'var(--faint)' }}>Cult</div>
        <h1 className="h1" style={{ marginTop: 20 }}>Что-то пошло не так</h1>
        <p className="small muted" style={{ marginTop: 9 }}>
          Экран не удалось отрисовать. Перезапустите приложение.
        </p>
        <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => location.reload()}>
          Перезапустить
        </button>
      </div>
    );
  }
}
