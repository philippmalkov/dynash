const DymonConfig = require('./types/DymonConfig');
const RequestScope = require('./types/RequestScope');

class Dymon extends DymonConfig {
  getAvailableOutputChannels() {
    return this.outputChannels.filter(outputChannel => outputChannel.requestAccess());
  }

  patchDynamo(Dynamo) {
    Dynamo.$Dymon = this;

    const prototypeOfDynamo = Object.getPrototypeOf(Dynamo);
    this.trackedMethods.forEach((methodName) => {
      const originalFunction = prototypeOfDynamo[methodName];

      const self = this;
      Dynamo[methodName] = function dymonWrapper(request = {}, reqCallback) {
        const availableOutputChannels = self.getAvailableOutputChannels();

        if (availableOutputChannels.length === 0) {
          if (reqCallback) {
            return originalFunction.call(Dynamo, request, reqCallback);
          }

          return originalFunction.call(Dynamo, request);
        }

        request.ReturnConsumedCapacity = self.consumedCapacityType;

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
              return reqCallback(reqError, reqResponse);
            }

            requestScope.registerResponse(reqResponse);

            return reqCallback(reqError, reqResponse);
          });
        }

        const req = originalFunction.call(Dynamo, request);

        const requestPromise = req.promise();
        req.promise = () => requestPromise;

        requestPromise.then(reqResponse => requestScope.registerResponse(reqResponse));

        return req;
      };
    });
  }
}

module.exports = Dymon;
