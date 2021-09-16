import { Component } from '@angular/core';
import { io as IO } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'searchio-frontend';

  constructor() {

    const socket = IO('http://localhost:5000', { transports: ["websocket"]});

    socket.on("connect", () => {
      console.log("Connected!");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected!");
    })

    socket.on("connect_error", (err) => {
      console.log("Error", console.log(err));
    })

  }


}
