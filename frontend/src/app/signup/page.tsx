
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-base';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('USA');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName || !companyName || !phone || !region) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          companyName: companyName,
          phone: phone,
          region: region
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const verificationRequired = data?.verificationRequired !== false;
      toast({
        title: 'Account Created!',
        description: verificationRequired
          ? 'Please verify your email to continue.'
          : 'Account created. You can log in now.',
      });

      router.push('/login');

    } catch (error: any) {
      setError(error.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };



  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <Link href="/" className="absolute top-8 left-8 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
      <div className="mb-8">
        <Link href="/">
          <Image src="/logo.png" alt="YourLegal Logo" width={180} height={40} />
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join thousands of global founders.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-50"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="ACME Inc."
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone No.</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 010 9999"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Country</Label>
              <select
                id="region"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <option value="USA">United States (USA)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="India">India</option>
                <option value="Singapore">Singapore</option>
                <option value="Australia">Australia</option>
                <option value="Netherlands">Netherlands</option>
                <option value="SaudiArabia">Saudi Arabia</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50"
                placeholder="6+ characters"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full font-bold shadow-lg shadow-blue-200" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account & Go to Portal
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
