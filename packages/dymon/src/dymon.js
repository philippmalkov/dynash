const AllowedMethods = require('./constants/AllowedMethods');
const RequestScope = require('./types/request-scope');

class Dymon {
  constructor(props) {
    let trackedMethods;

    if (props.trackedMethods) {
      trackedMethods = props.trackedMethods.filter(
        rawMethod => AllowedMethods.all.has(rawMethod),
      );
    } else {
      trackedMethods = AllowedMethods.all;
    }

    if (trackedMethods.length === 0) {
      throw new Error('No methods for tracking passed.');
    }

    this.consumedCapacityType = props.full ? 'INDEXES' : 'TOTAL';
    this.trackedMethods = trackedMethods;
    this.outputChannels = props.outputChannels;
  }

  getAvailableOutputChannels() {
    return this.outputChannels.filter(outputChannel => outputChannel.requestAccess());
  }

  patchDynamo(Dynamo) {
    Dynamo.$Dymon = this;

    const prototypeOfDynamo = Object.getPrototypeOf(Dynamo);
    this.trackedMethods.forEach((methodName) => {
      const originalFunction = prototypeOfDynamo[methodName];

      Dynamo[methodName] = (request = {}, reqCallback) => {
        const availableOutputChannels = this.getAvailableOutputChannels();

        if (availableOutputChannels.length === 0) {
          if (reqCallback) {
            return originalFunction.call(Dynamo, request, reqCallback);
          }

          return originalFunction.call(Dynamo, request);
        }

        request.ReturnConsumedCapacity = this.consumedCapacityType;

        const requestScope = new RequestScope({
          caller: methodName,
          request,
          outputChannels: availableOutputChannels,
        });

        /* Notice:
        * There is request callback issue trick below.
        * AWS SDK JS doesn't allow to handle callback twice.
        * It's why IF callback given by user,
        * we handle response in callback wrapper.
        * And IF callback not given then
        * we handle response in a Promise received from a .promise() function
        * and override the promise function to return the received Promise.
        * */
        if (reqCallback) {
          return originalFunction.call(Dynamo, request, (reqError, reqResponse) => {
            if (!reqError) {
              requestScope.registerError(reqError);

              return reqCallback(reqError, reqResponse);
            }

            requestScope.registerResponse(reqResponse);

            return reqCallback(reqError, reqResponse);
          });
        }

        const req = originalFunction.call(Dynamo, request);

        const requestPromise = req.promise();
        req.promise = () => requestPromise;

        requestPromise
          .then((reqResponse) => {
            requestScope.registerResponse(reqResponse);
          })
          .catch((reqError) => {
            requestScope.registerError(reqError);
            throw reqError;
          });

        return req;
      };
    });
  }
}

module.exports = Dymon;
