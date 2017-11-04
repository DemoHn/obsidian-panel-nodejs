#include <node.h>
#include "service.h"
#include <stdio.h>

namespace panelCores{

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;
    using v8::Function;
    using v8::Persistent;
    using v8::Handle;

    Local<Function> cb;
    Isolate* _isolate = NULL;
    Persistent<Function> gfn;

    void RunService(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        win32_service_run();
        //args.GetReturnValue().Set(String::NewFromUtf8(isolate, "test run"));
    }
    
    void _run_onstop()
    {
        _write_log("on stop exec! \n");
        //const unsigned _argc = 1;
        //Local<Value> _argv[_argc] = { String::NewFromUtf8(_isolate, "hello world") };

        if(! gfn.IsEmpty()){
            _write_log("gfn is not empty\n");

            //gfn.Call((*gfn), 0, {});

            _write_log("f call\n");
        }
       /* if(cb.IsEmpty()){
            _write_log("cb is empty\n");
        }else{
            _write_log("cb is not empty\n");
        }
        
        if(! cb.IsEmpty()){
            _write_log("callback not empty \n");
            cb->Call(Null(_isolate), argc, argv);
            _write_log("call onstop js function success \n");
        }*/
    }

    void OnStopFunction(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        //cb = Local<Function>::Cast(args[0]);            

        gfn.Reset(isolate, Local<Function>::Cast(args[0]));

        _write_log("register stop function \n");
        win32_service_on_stop = _run_onstop;
    }

    void Init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "service_run", RunService);
        NODE_SET_METHOD(exports, "on_stop", OnStopFunction);
    }

    NODE_MODULE(panel_cores, Init)

}  // namespace demo