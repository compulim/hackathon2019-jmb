function createElement(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);

  Object.keys(attributes).forEach(name => {
    if (name === 'style') {
      const style = attributes.style;
      const styleStrings = [];

      Object.keys(style).forEach(name => {
        const value = style[name];
        const normalizedName = name.replace(/[A-Z]/gu, c => `-${ c.toLowerCase() }`);

        styleStrings.push(`${ normalizedName }: ${ typeof value === 'number' ? `${ value }px` : value }`);
      });

      element.setAttribute(name, styleStrings.join('; '));
    } else {
      element.setAttribute(name, attributes[name]);
    }
  });

  if (children.length) {
    const fragment = document.createDocumentFragment();

    for (let child of children) {
      fragment.appendChild(child);
    }

    element.appendChild(fragment);
  }

  return element;
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.addEventListener('load', resolve);
    script.addEventListener('error', ({ error, message }) => reject(error || new Error(message)));
    script.setAttribute('src', src);

    document.body.appendChild(script);
  });
}

async function main() {
  await loadScript('https://cdn.botframework.com/botframework-webchat/4.5.0/webchat.js');

  const { createDirectLine, createStore, renderWebChat } = window.WebChat;
  const { token } = await (await fetch('http://localhost:3978/api/directlinetoken')).json();
  const webChatElement = createElement(
    'div',
    {
      style: {
        bottom: 10,
        boxShadow: '0 0 10px rgba(0, 0, 0, .1)',
        maxWidth: 360,
        minWidth: 320,
        position: 'fixed',
        right: 10,
        top: 100,
      }
    }
  );

  const store = createStore({}, ({ dispatch }) => next => action => {
    const { type } = action;

    if (type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: {
          name: 'welcome'
        }
      });

      document.querySelector('[data-id="webchat-sendbox-input"]').focus();
    } else if (type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const { activity } = action.payload;
      const { name, type: activityType } = activity;

      if (activityType === 'event' && name === 'SET_FIELD') {
        const { name, value } = activity.value;
        const input = document.querySelector(`form [name="${ name }"]`);

        if (!input) {
          throw new Error(`Cannot find input element named "${ name }"`);
        }

        input.value = value;
      }
    }

    return next(action);
  });

  renderWebChat({
    directLine: createDirectLine({
      token
    }),
    store,
    styleOptions: {
      backgroundColor: 'rgba(255, 255, 255, .9)'
    }
  }, webChatElement);

  document.body.appendChild(webChatElement);
}

window.addEventListener('load', () => {
  main().catch(err => console.error(err));
});
