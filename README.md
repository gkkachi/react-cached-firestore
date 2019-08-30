# react-cached-firestore


## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save https://github.com/gkkachi/react-cached-firestore.git
    
## Usage

### ```App.tsx```

```tsx
import React from 'react'
import * as firebase from 'firebase/app';
import Provider from 'react-cached-firestore'
import MyApp from './MyApp.tsx'

const app = firebase.initializeApp({ ... })

const App: React.FC = () => {

    ...
    
    return (
        <Provider app={app}>
            <MyApp />
        </Provider>
    )
}
```

### ```AmazingApp.tsx```

```tsx
import { useDocumentsContext } from 'react-cached-firestore'

const AmazingApp: React.FC = () => {
    const path: string = 'PATH/TO/DOCUMENT'
    const { getDoc } = useDocumentsContext()

    // if you want the latest data,
    const snap = getDoc(path)

    // if you do not need the latest data,
    // const snap = getDoc(path, false)
    
    const snap = docs[path]
    
    if (snap) {
        // do something
    } else {
        // do something
    }
    
    ...
}
```
