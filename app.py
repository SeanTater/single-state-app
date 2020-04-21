#!/usr/bin/env python3
""" Server side of a unified state web app.
    In most cases your code will be shorter, but this is more documentation than code.
"""
import asyncio
import json
import traceback
import websockets

class Router:
    """ Server-end of the websocket, with all its context.
        For small applications, it may make sense to keep all your code in this file, but in larger
        cases you should consider making these functions delegate the majority of their work to
        modules stored in the supporting package.
    """
    def __init__(self, ws):
        """ Create a new websocket state.
            Each instance of this class corresponds 1:1 to a browser on the other end, so you are
            free to populate it with any instance variables make sense to you. But for simplicity,
            we are going to replicate the state on the other end exactly.
        """
        self._ws = ws
        self._state = {}
    
    async def _send(self, **message):
        """ Trivial convenience wrapper to serialize and send kwargs as a message """
        await self._ws.send(json.dumps(message))
    
    async def assign(self, key, value):
        """ Set a state variable to a value given in the message
            
            Accepts: a websocket, as provided by self.route()
        """
        # This is still async just to be compatible with the other handlers
        self._state[key] = value
    
    async def broken(self):
        """ This example of a broken handler shows exception handling """
        assert 1 == 0, "Seems I've made a mistake!"
    
    async def axpy(self, a, x, y):
        """ This example shows sending some basic types
            
            Accepts:
                a: a scalar
                x: a vector of numbers
                y: a vector of numbers
            Returns:
                the vector corresponding to a * x + y
        """
        # Note these are just lists, not numpy arrays.
        # Numpy arrays are not JSON serializable on their own but they are with A.tolist()
        
        # Also note, that we don't return here because every message is generally independent,
        # so there isn't really a notion of a reply. This is just a different message emitted
        # as a consequence of the first one.
        # You are free to _send() as many times as you want in any method, not just once.
        await self._send(tag="assign", key="result_vector", value=[a * xi + yi for xi, yi in zip(x, y)])
    
    async def route(self):
        """ Start an event loop directing messages to a methods on Router according to their tag.
            Intended to be used as a callback for websockets.serve()
        """
        while True:
            # Read the message from the socket and decode as JSON. This will fail if the other
            # end disconnects or a message is malformed
            message = json.loads(await self._ws.recv())
            assert not message["tag"].startswith("_"), "Calling private methods is not allowed"
            try:
                # This sprinkle of magic looks for a method by that name,
                # and if it doesn't find it, it complains but continues.
                # Then it unpacks the message as kwargs and passes it to the handler.
                tag = message.pop("tag") # Remove and use the tag
                await getattr(self, tag, lambda **_x: print("Route not found:", x))(**message)
            except Exception as e:
                # General catch-all traceback sends the error to the frontend to explain
                traceback.print_exc() # Useful if you are reading the terminal too
                # Send the error as a message back to the frontend
                await self._send(tag="error", error=str(e), details=traceback.format_exc())

# The majority of the work is done by the websockets module, and we just call that here
if __name__ == "__main__":
    start_server = websockets.serve(lambda ws, _path: Router(ws).route(), "0.0.0.0", 8001)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()