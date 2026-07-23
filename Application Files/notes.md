[ ] performance mode vs practice mode.
performance mode: the clock for all phones is set and synced to the laptop. there is no escape button on the phone
practice mode: the phone begins on its own. there is an escape button.

Sync.
Configure this app so that all users that are on the same network are in sync with each other. This is so that the states from all 5 players can be viewed by 5 individual users, each from different devices on a shared network. This is all controlled by a host user, which is selected from button 6. Here are the tasks involved in doing this:

1. There are client users and one host user. These users are determined when the user selects a button. btn1, btn2, btn3, btn4, and btn5 make the user a client user. btn6 (the "laptop" button) makes the user a host user.
2. After a client user selects a button, StartTime does not immediately start. Rather, that user is waiting until their StartTime is begun by the host user.
3. Once the host user is selected, they do not view the various states read from the csv. Rather, they navigate to a page which has a start button. Once this start button is selected, StartTime begins for every single client user at the same time. It is extremely important that all users are in sync with each other, and care should be taken to ensure that all the states from all the users are being triggered in synchronization with each other.
