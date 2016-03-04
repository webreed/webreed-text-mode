// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


// Packages
import given from "mocha-testdata";
import should from "should";

// Webreed Core
import Environment from "webreed-core/lib/Environment";

// Project
import TextMode from "../src/TextMode";
import setup from "../src/setup";


describe("#setup(options)", function () {

  it("is a function", function () {
    setup
      .should.be.a.Function();
  });

  it("is named 'setup'", function () {
    setup.name
      .should.be.eql("setup");
  });

  it("adds 'text' mode to the environment", function () {
    let env = new Environment();
    setup(env);
    env.modes.get("text")
      .should.be.instanceOf(TextMode);
  });

});
