import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SupabaseTest() {
  const [results, setResults] = useState<string[]>([]);
  const { user } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setResults([]);
    addResult('🔍 Testing Supabase connection...');

    // Test 1: Check user
    addResult(`✅ User authenticated: ${user?.email || 'No user'}`);

    // Test 2: Test products table
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        addResult(`❌ Products table error: ${error.message}`);
      } else {
        addResult(`✅ Products table accessible. Total: ${count || 0} products`);
        if (data && data.length > 0) {
          addResult(`   First product: ${data[0].title}`);
        }
      }
    } catch (err) {
      addResult(`❌ Products table exception: ${err}`);
    }

    // Test 3: Test profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        addResult(`❌ Profiles table error: ${error.message}`);
      } else {
        addResult(`✅ Profiles table accessible. Found ${data?.length || 0} profiles`);
      }
    } catch (err) {
      addResult(`❌ Profiles table exception: ${err}`);
    }

    // Test 4: Test current user profile
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          addResult(`❌ Your profile error: ${error.message}`);
        } else if (!data) {
          addResult(`⚠️ Your profile not found! This might cause issues.`);
        } else {
          addResult(`✅ Your profile found: @${data.username}`);
        }
      } catch (err) {
        addResult(`❌ Your profile exception: ${err}`);
      }
    }

    // Test 5: Test storage
    try {
      const { error } = await supabase
        .storage
        .from('products')
        .list('', { limit: 1 });
      
      if (error) {
        addResult(`❌ Storage error: ${error.message}`);
      } else {
        addResult(`✅ Storage accessible`);
      }
    } catch (err) {
      addResult(`❌ Storage exception: ${err}`);
    }

    // Test 6: Test JOIN query
    try {
      const { error } = await supabase
        .from('products')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .limit(1);
      
      if (error) {
        addResult(`❌ JOIN query error: ${error.message}`);
        addResult(`   This is likely the issue!`);
      } else {
        addResult(`✅ JOIN query works`);
      }
    } catch (err) {
      addResult(`❌ JOIN query exception: ${err}`);
    }

    addResult('🏁 Tests completed!');
  };

  return (
    <div className="fixed top-4 right-4 z-[200] bg-white rounded-lg shadow-2xl p-4 max-w-md max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Supabase Connection Test</h3>
      
      <button
        onClick={testConnection}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition mb-4"
      >
        Run Tests
      </button>

      <div className="space-y-1 text-xs font-mono bg-slate-50 p-3 rounded max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-slate-500">Click "Run Tests" to start</p>
        ) : (
          results.map((result, i) => (
            <div key={i} className="text-slate-700">{result}</div>
          ))
        )}
      </div>
    </div>
  );
}
