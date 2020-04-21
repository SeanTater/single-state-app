# Unified state application template

Using websockets, a super basic but intuitive router and a reducer, you can create intriguing
interactive applications with little boilerplate in a remarkably short time.

# Invocation
To run the application, you need at least Python 3.6. When you have that, you can run this:
```
pip3 install -r requirements.txt
# Serve the frontend using a super basic static file server
(cd frontend; python3 -m http.server 4001) &
# Run the backend websocket server
python3 ./app.py
```