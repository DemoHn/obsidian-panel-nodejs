#include <nan.h>
#include <uv.h>

void TestModule(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
  v8::local<v8::Number> num = Nan::New(2333);
  info.GetReturnValue().Set(num);
}

void Init(v8::Local<v8::Object> exports)
{
  Nan::SetMethod(exports, "test" , TestModule);
}
NODE_MODULE(process_watcher, Init)
