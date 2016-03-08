// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import given from "mocha-testdata";
import should from "should";

import {Environment} from "webreed-core/lib/Environment";

import {TextMode} from "../lib/TextMode";
import setup from "../lib/setup";


describe("#setup(env, options)", function () {

  it("is a function", function () {
    setup
      .should.be.a.Function();
  });

  it("adds 'text' mode to the environment", function () {
    let env = new Environment();
    setup(env);
    env.modes.get("text")
      .should.be.instanceOf(TextMode);
  });

});
